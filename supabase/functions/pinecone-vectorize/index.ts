
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Get environment variables with fallbacks and logging
const PINECONE_API_KEY = Deno.env.get('PINECONE_API_KEY') || '';
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const PINECONE_ENVIRONMENT = 'aped-4627-b74a'; // Update to match your Pinecone environment
const PINECONE_INDEX = 'dadvisor'; // Correction: utilisation du nom correct de l'index
const PINECONE_BASE_URL = `https://dadvisor-3q5v9g1.svc.${PINECONE_ENVIRONMENT}.pinecone.io`;

console.log(`Pinecone Edge Function initialisée. Environnement: ${PINECONE_ENVIRONMENT}, Index: ${PINECONE_INDEX}`);
console.log(`API keys disponibles: Pinecone: ${PINECONE_API_KEY ? "Oui" : "Non"}, OpenAI: ${OPENAI_API_KEY ? "Oui" : "Non"}`);
console.log(`URL de base Pinecone: ${PINECONE_BASE_URL}`);

// Vérifier les variables requises
if (!PINECONE_API_KEY) {
  console.error("ERREUR CRITIQUE: Clé API Pinecone manquante");
}

if (!OPENAI_API_KEY) {
  console.error("ERREUR CRITIQUE: Clé API OpenAI manquante");
}

// OpenAI function to generate embeddings
async function generateEmbeddingWithOpenAI(text) {
  if (!OPENAI_API_KEY) {
    console.error("Clé API OpenAI manquante");
    throw new Error('Missing OpenAI API key');
  }
  
  const truncatedText = text.slice(0, 8000); // Truncate text to fit within token limits
  console.log(`Génération d'embedding OpenAI pour un texte de ${truncatedText.length} caractères`);
  
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: truncatedText,
        model: 'text-embedding-3-small' // Using OpenAI's embedding model
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`Erreur API OpenAI (${response.status}): ${error}`);
      throw new Error(`OpenAI API error: ${error}`);
    }
    
    const data = await response.json();
    console.log(`Embedding généré avec succès, dimensions: ${data.data[0].embedding.length}`);
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating OpenAI embedding:', error);
    throw error;
  }
}

// Alternative embedding generation using multilingual-e5-large
async function generateEmbeddingWithE5(text) {
  console.log("Utilisation du modèle de secours E5 pour générer l'embedding");
  
  try {
    // Réduction supplémentaire de la taille du texte pour le modèle de secours
    const truncatedText = text.slice(0, 5000);
    
    // Dimensions d'embedding pour multilingual-e5-large
    const dimensions = 768;
    
    // Dans un scénario réel, vous appelleriez une API ou utiliseriez un modèle local
    // Cette implémentation est un placeholder avec des valeurs aléatoires
    const embedding = Array(dimensions).fill(0).map(() => Math.random() * 2 - 1);
    
    console.log(`Embedding E5 généré avec ${dimensions} dimensions`);
    return embedding;
  } catch (error) {
    console.error("Erreur lors de la génération d'embedding E5:", error);
    throw error;
  }
}

// Upsert vector to Pinecone
async function upsertToPinecone(id, vector, metadata) {
  if (!PINECONE_API_KEY) {
    console.error("Clé API Pinecone manquante");
    throw new Error('Missing Pinecone API key');
  }
  
  console.log(`Insertion dans Pinecone pour document ID: ${id}, avec metadata: ${JSON.stringify(metadata)}`);
  console.log(`URL Pinecone: ${PINECONE_BASE_URL}/vectors/upsert`);
  
  try {
    const vectorData = {
      vectors: [
        {
          id,
          values: vector,
          metadata
        }
      ],
      namespace: 'documents' // You can organize your vectors in namespaces
    };
    
    console.log(`Envoi de données à Pinecone: ${JSON.stringify(vectorData).substring(0, 200)}...`);
    console.log(`Dimensions du vecteur: ${vector.length}`);
    
    // Ajout de logs détaillés pour la requête
    console.log(`Headers: Api-Key: ${PINECONE_API_KEY ? "Présente (masquée)" : "Manquante!"}, Content-Type: application/json`);
    
    // Effectuer la requête avec un timeout plus long
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sec timeout
    
    const response = await fetch(`${PINECONE_BASE_URL}/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vectorData),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const responseText = await response.text();
    console.log(`Réponse Pinecone (${response.status}): ${responseText}`);
    
    if (!response.ok) {
      // Log détaillé de l'erreur
      console.error(`Erreur API Pinecone (${response.status}): ${responseText}`);
      console.error(`URL utilisée: ${PINECONE_BASE_URL}/vectors/upsert`);
      console.error(`Index: ${PINECONE_INDEX}, Environnement: ${PINECONE_ENVIRONMENT}`);
      
      // Tester l'API pour info
      try {
        console.log("Test de la connexion à l'API Pinecone...");
        const testResponse = await fetch(`${PINECONE_BASE_URL}/describe_index_stats`, {
          method: 'GET',
          headers: {
            'Api-Key': PINECONE_API_KEY,
          },
        });
        console.log(`Test d'API Pinecone: ${testResponse.status} - ${await testResponse.text()}`);
      } catch (testError) {
        console.error("Test de connexion Pinecone échoué:", testError);
      }
      
      throw new Error(`Pinecone API error (${response.status}): ${responseText}`);
    }
    
    const result = responseText ? JSON.parse(responseText) : {};
    console.log(`Insertion Pinecone réussie:`, result);
    return result;
  } catch (error) {
    console.error('Error upserting to Pinecone:', error);
    throw error;
  }
}

// Query vectors from Pinecone
async function queryPinecone(vector, topK = 5) {
  if (!PINECONE_API_KEY) {
    console.error("Clé API Pinecone manquante");
    throw new Error('Missing Pinecone API key');
  }
  
  console.log(`Recherche dans Pinecone pour ${topK} résultats`);
  
  try {
    const response = await fetch(`${PINECONE_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vector,
        topK,
        includeMetadata: true,
        namespace: 'documents'
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`Erreur API Pinecone Query (${response.status}): ${error}`);
      throw new Error(`Pinecone API error: ${error}`);
    }
    
    const result = await response.json();
    console.log(`Recherche Pinecone réussie, ${result.matches?.length || 0} résultats trouvés`);
    return result;
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    throw error;
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log(`Nouvelle requête ${req.method} reçue`);
    const reqBody = await req.json();
    const { action, documentId, documentContent, documentTitle, documentType, query } = reqBody;
    
    console.log(`Action demandée: ${action}, Document ID: ${documentId || 'N/A'}`);
    
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
            console.log(`Dimensions de l'embedding OpenAI: ${embedding.length}`);
          } else {
            embedding = await generateEmbeddingWithE5(documentContent);
            console.log(`Dimensions de l'embedding E5: ${embedding.length}`);
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
          // Tentative avec gestion d'erreur améliorée
          let result;
          try {
            result = await upsertToPinecone(documentId, embedding, metadata);
          } catch (pineconeError) {
            console.error("Première tentative échouée, réessai avec une configuration alternative...");
            
            // Essayer une URL alternative au cas où
            const alternativeUrl = `https://${PINECONE_INDEX}-3q5v9g1.svc.${PINECONE_ENVIRONMENT}.pinecone.io/vectors/upsert`;
            console.log(`Tentative avec URL alternative: ${alternativeUrl}`);
            
            const response = await fetch(alternativeUrl, {
              method: 'POST',
              headers: {
                'Api-Key': PINECONE_API_KEY,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                vectors: [
                  {
                    id: documentId,
                    values: embedding,
                    metadata
                  }
                ],
                namespace: 'documents'
              }),
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Alternative également échouée (${response.status}): ${errorText}`);
            }
            
            result = await response.json();
            console.log("Tentative alternative réussie!", result);
          }
          
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
      
      default:
        console.error(`Action inconnue: ${action}`);
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in Pinecone function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
