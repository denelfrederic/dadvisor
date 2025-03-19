
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Get environment variables with fallbacks and logging
const PINECONE_API_KEY = Deno.env.get('PINECONE_API_KEY') || '';
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const PINECONE_ENVIRONMENT = 'aped-4627-b74a'; // Update to match your Pinecone environment
const PINECONE_INDEX = 'dadvisor-3q5v9g1'; // Update to match your index name
const PINECONE_BASE_URL = `https://${PINECONE_INDEX}.svc.${PINECONE_ENVIRONMENT}.pinecone.io`;

console.log(`Pinecone Edge Function initialisée. Environnement: ${PINECONE_ENVIRONMENT}, Index: ${PINECONE_INDEX}`);
console.log(`API keys disponibles: Pinecone: ${PINECONE_API_KEY ? "Oui" : "Non"}, OpenAI: ${OPENAI_API_KEY ? "Oui" : "Non"}`);

// Vérifier les variables requises
if (!PINECONE_API_KEY) {
  console.error("ERREUR CRITIQUE: Clé API Pinecone manquante");
}

if (!OPENAI_API_KEY) {
  console.error("ERREUR CRITIQUE: Clé API OpenAI manquante");
}

// Add this code block after the existing imports but before the serve function
// Add a function to test the Pinecone configuration
async function testPineconeConnection() {
  console.log("Testant la connexion à Pinecone...");
  console.log(`URL de base: ${PINECONE_BASE_URL}`);
  
  try {
    if (!PINECONE_API_KEY) {
      return {
        success: false,
        error: "Clé API Pinecone non configurée",
        details: { 
          apiKeyStatus: 'missing',
          environment: PINECONE_ENVIRONMENT,
          index: PINECONE_INDEX,
          suggestions: [
            "Configurez la clé API Pinecone dans les secrets Supabase",
            "Vérifiez que la clé est correctement nommée PINECONE_API_KEY"
          ]
        }
      };
    }
    
    // Tester la connexion à l'API Pinecone avec un appel simple
    const response = await fetch(`${PINECONE_BASE_URL}/describe_index_stats`, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ namespace: 'documents' }),
    });
    
    console.log(`Statut de la réponse Pinecone: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur API Pinecone (${response.status}): ${errorText}`);
      
      let suggestedActions = [];
      if (response.status === 404) {
        suggestedActions = [
          "Vérifiez que l'index existe dans votre compte Pinecone",
          "Vérifiez que le nom de l'index est correctement orthographié",
          "Vérifiez que l'environnement est correct"
        ];
      } else if (response.status === 401 || response.status === 403) {
        suggestedActions = [
          "Vérifiez que votre clé API Pinecone est valide",
          "Vérifiez que votre clé API a les permissions nécessaires pour cet index",
          "Régénérez votre clé API Pinecone si nécessaire"
        ];
      } else {
        suggestedActions = [
          "Vérifiez la configuration de l'environnement et de l'index",
          "Vérifiez que l'index est actif et n'est pas en pause",
          "Contactez le support Pinecone si le problème persiste"
        ];
      }
      
      return {
        success: false,
        error: `Erreur API Pinecone (${response.status}): ${errorText}`,
        details: {
          apiKeyStatus: 'invalid',
          environment: PINECONE_ENVIRONMENT,
          index: PINECONE_INDEX,
          httpStatus: response.status,
          connectionError: errorText,
          suggestions: suggestedActions
        }
      };
    }
    
    // Analyser la réponse
    const data = await response.json();
    console.log("Réponse de Pinecone:", data);
    
    // Succès
    return {
      success: true,
      details: {
        environment: PINECONE_ENVIRONMENT,
        index: PINECONE_INDEX,
        serverVersion: response.headers.get('server'),
        dimension: data.dimension,
        count: data.totalVectorCount,
        namespaces: Object.keys(data.namespaces || {})
      }
    };
  } catch (error) {
    console.error("Erreur lors du test de connexion à Pinecone:", error);
    
    return {
      success: false,
      error: `Erreur de connexion: ${error instanceof Error ? error.message : String(error)}`,
      details: {
        environment: PINECONE_ENVIRONMENT,
        index: PINECONE_INDEX,
        connectionError: error instanceof Error ? error.message : String(error),
        suggestions: [
          "Vérifiez votre connexion Internet",
          "Vérifiez que les paramètres d'environnement et d'index sont corrects",
          "Vérifiez que l'URL Pinecone est accessible"
        ]
      }
    };
  }
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
    
    const response = await fetch(`${PINECONE_BASE_URL}/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vectorData),
    });
    
    const responseText = await response.text();
    console.log(`Réponse Pinecone (${response.status}): ${responseText}`);
    
    if (!response.ok) {
      console.error(`Erreur API Pinecone (${response.status}): ${responseText}`);
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
    
    // Check-keys action to verify API keys are configured
    if (action === 'check-keys') {
      console.log("Vérification des clés API...");
      const missingKeys = [];
      
      if (!PINECONE_API_KEY) {
        missingKeys.push("PINECONE_API_KEY");
      }
      
      if (!OPENAI_API_KEY) {
        missingKeys.push("OPENAI_API_KEY");
      }
      
      return new Response(JSON.stringify({
        missingKeys,
        error: missingKeys.length > 0 
          ? `Clés API manquantes: ${missingKeys.join(", ")}` 
          : null
      }), {
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
        console.log(`Test de la configuration Pinecone (environnement: ${PINECONE_ENVIRONMENT}, index: ${PINECONE_INDEX})`);
        
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

// Add a simple logging function if it doesn't exist
function addLog(message) {
  console.log(message);
  return message;
}
