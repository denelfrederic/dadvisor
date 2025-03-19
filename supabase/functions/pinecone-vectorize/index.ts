
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Import configuration and helpers
import { corsHeaders, OPENAI_API_KEY, PINECONE_API_KEY, addLog } from "./config.ts";
import { testPineconeConnection, checkApiKeys } from "./diagnostics.ts";
import { generateEmbeddingWithOpenAI, generateEmbeddingWithE5 } from "./embedding.ts";
import { upsertToPinecone, queryPinecone } from "./pinecone.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const reqData = await req.text();
    console.log(`Nouvelle requête ${req.method} reçue: ${reqData.substring(0, 200)}...`);
    
    let reqBody;
    try {
      reqBody = JSON.parse(reqData);
    } catch (parseError) {
      console.error("Erreur de parsing JSON:", parseError);
      return new Response(JSON.stringify({
        success: false,
        error: `Erreur de parsing JSON: ${parseError.message}`,
        rawData: reqData.substring(0, 500)
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { action, documentId, documentContent, documentTitle, documentType, query } = reqBody;
    
    console.log(`Action demandée: ${action}, Document ID: ${documentId || 'N/A'}`);
    
    // Check-keys action to verify API keys are configured
    if (action === 'check-keys') {
      console.log("Vérification des clés API...");
      const apiStatus = checkApiKeys();
      console.log("Résultat de la vérification:", apiStatus);
      
      return new Response(JSON.stringify(apiStatus), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Vérification des clés API et message d'erreur détaillé
    if (!OPENAI_API_KEY && !PINECONE_API_KEY) {
      console.error("ERREUR CRITIQUE: Les clés API OpenAI et Pinecone sont manquantes");
      return new Response(JSON.stringify({
        success: false,
        error: "Configuration incomplète: Les clés API OpenAI et Pinecone sont manquantes. Veuillez configurer ces clés dans les secrets Supabase."
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!PINECONE_API_KEY) {
      console.error("ERREUR CRITIQUE: Clé API Pinecone manquante");
      return new Response(JSON.stringify({
        success: false,
        error: "Clé API Pinecone manquante. Veuillez configurer cette clé dans les secrets Supabase."
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!OPENAI_API_KEY) {
      console.warn("AVERTISSEMENT: Clé API OpenAI manquante, utilisation du modèle de secours");
    }
    
    switch (action) {
      case 'vectorize': {
        // Generate embedding for document content
        if (!documentContent || !documentId) {
          console.error("Paramètres manquants", reqBody);
          throw new Error('Missing document content or ID');
        }
        
        console.log(`Génération d'embedding pour document: ${documentId} (content length: ${documentContent.length})`);
        
        // Generate embedding using OpenAI or fallback
        let embedding;
        try {
          if (OPENAI_API_KEY) {
            embedding = await generateEmbeddingWithOpenAI(documentContent);
          } else {
            embedding = await generateEmbeddingWithE5(documentContent);
          }
        } catch (embeddingError) {
          console.error("Erreur lors de la génération d'embedding:", embeddingError);
          return new Response(JSON.stringify({
            success: false,
            error: `Échec de génération d'embedding: ${embeddingError.message}`
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Store in Pinecone with metadata
        const metadata = {
          title: documentTitle || 'Untitled',
          type: documentType || 'unknown',
          contentSnippet: documentContent.slice(0, 300) + '...',
          length: documentContent.length
        };
        
        try {
          const result = await upsertToPinecone(documentId, embedding, metadata);
          
          console.log(`Vectorisation réussie pour document: ${documentId}`);
          
          // Also return the embedding for storage in Supabase as a backup
          return new Response(JSON.stringify({
            success: true,
            documentId,
            embedding,
            pineconeResult: result
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (pineconeError) {
          console.error("Erreur lors de l'insertion dans Pinecone:", pineconeError);
          return new Response(JSON.stringify({
            success: false,
            error: `Échec d'insertion dans Pinecone: ${pineconeError.message}`
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      
      case 'query': {
        if (!query) {
          console.error("Requête de recherche sans texte", reqBody);
          throw new Error('Missing query text');
        }
        
        console.log(`Recherche sémantique: "${query}"`);
        
        // Generate embedding for query
        let embedding;
        try {
          if (OPENAI_API_KEY) {
            embedding = await generateEmbeddingWithOpenAI(query);
          } else {
            embedding = await generateEmbeddingWithE5(query);
          }
        } catch (embeddingError) {
          console.error("Erreur lors de la génération d'embedding pour la recherche:", embeddingError);
          return new Response(JSON.stringify({
            success: false,
            error: `Échec de génération d'embedding: ${embeddingError.message}`
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Query Pinecone for similar documents
        try {
          const results = await queryPinecone(embedding, 5);
          
          console.log(`${results.matches?.length || 0} résultats trouvés pour la requête`);
          
          return new Response(JSON.stringify({
            success: true,
            results: results.matches || []
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (searchError) {
          console.error("Erreur lors de la recherche dans Pinecone:", searchError);
          return new Response(JSON.stringify({
            success: false,
            error: `Échec de recherche dans Pinecone: ${searchError.message}`
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      
      case 'test-config': {
        console.log(`Test de la configuration Pinecone`);
        
        // Test the connection to Pinecone
        const testResult = await testPineconeConnection();
        
        // Log the result
        if (testResult.success) {
          console.log(`Test de connexion Pinecone réussi! Dimension: ${testResult.details.dimension}, Vecteurs: ${testResult.details.count}`);
        } else {
          console.log(`Échec du test de connexion Pinecone: ${testResult.error}`);
        }
        
        return new Response(JSON.stringify(testResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      default:
        console.error(`Action inconnue: ${action}`);
        return new Response(JSON.stringify({
          success: false,
          error: `Action inconnue: ${action}`
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in Pinecone function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: `Erreur serveur: ${error.message || String(error)}`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
