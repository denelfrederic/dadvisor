import { serve } from 'std/server';
import { OpenAI } from 'openai';
import { load } from "std/dotenv/mod.ts";

// Import configuration
import { 
  PINECONE_API_KEY, 
  OPENAI_API_KEY, 
  PINECONE_INDEX, 
  PINECONE_PROJECT, 
  PINECONE_ENVIRONMENT,
  PINECONE_API_V1_URL,
  PINECONE_API_V2_URL,
  PINECONE_DIRECT_URL,
  REQUEST_TIMEOUT,
  validateConfig
} from './config.ts';

// Enable CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Function to generate OpenAI embeddings
async function generateOpenAIEmbedding(content) {
  try {
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: content,
    });
    return embeddingResponse.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Function to upsert data to Pinecone
async function upsertToPinecone(baseUrl, vectors) {
  const url = `${baseUrl}/vectors/upsert`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vectors }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pinecone Upsert Error: ${response.status} - ${errorText}`);
      throw new Error(`Pinecone Upsert Failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Pinecone upsert error:', error);
    throw error;
  }
}

// Helper function to create a successful response
function createSuccessResponse(data) {
  return new Response(JSON.stringify({ ...data, success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}

// Helper function to create an error response
function createErrorResponse(message, details = {}) {
  console.error('Error Response:', message, details);
  return new Response(JSON.stringify({ message, details, success: false }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 500,
  });
}

// Gestionnaire de requête
Deno.serve(async (req) => {
  // Gestion CORS pour les requêtes OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, documentId, documentContent, documentTitle, documentType } = await req.json();

    // Validation de la configuration au démarrage
    const configValidation = validateConfig();
    console.log("Configuration validée:", configValidation.valid);
    
    if (!configValidation.valid) {
      return createErrorResponse("Configuration Pinecone invalide: " + configValidation.warnings.join(", "));
    }

    // Action de vérification de configuration (pour debugging)
    if (action === 'config') {
      return createSuccessResponse(configValidation);
    }
    
    // Action de test de connexion
    if (action === 'test-connection') {
      try {
        // Essai avec l'API v1
        console.log(`Test de connexion avec l'API v1: ${PINECONE_API_V1_URL}`);
        const v1Result = await testPineconeConnection(PINECONE_API_V1_URL);
        if (v1Result.success) {
          return createSuccessResponse({
            success: true,
            message: "Connexion à Pinecone API v1 réussie",
            version: "v1",
            details: v1Result
          });
        }
        
        // Si l'API v1 échoue, essayer l'API v2
        console.log(`Test de connexion avec l'API v2: ${PINECONE_API_V2_URL}`);
        const v2Result = await testPineconeConnection(PINECONE_API_V2_URL);
        if (v2Result.success) {
          return createSuccessResponse({
            success: true,
            message: "Connexion à Pinecone API v2 réussie",
            version: "v2",
            details: v2Result
          });
        }
        
        // Enfin, essayer l'URL directe
        console.log(`Test de connexion avec l'URL directe: ${PINECONE_DIRECT_URL}`);
        const directResult = await testPineconeConnection(PINECONE_DIRECT_URL);
        if (directResult.success) {
          return createSuccessResponse({
            success: true,
            message: "Connexion à Pinecone URL directe réussie",
            version: "direct",
            details: directResult
          });
        }
        
        // Toutes les tentatives ont échoué
        return createSuccessResponse({
          success: false,
          message: "Toutes les tentatives de connexion ont échoué",
          attempts: {
            v1: v1Result,
            v2: v2Result,
            direct: directResult
          }
        });
      } catch (error) {
        console.error("Erreur lors du test de connexion:", error);
        return createSuccessResponse({
          success: false,
          message: `Erreur lors du test de connexion: ${error.message}`,
          error: error.message
        });
      }
    }

    // Action de vectorisation (réécrire avec la nouvelle logique)
    if (action === 'vectorize') {
      // Validation des paramètres
      if (!documentId || !documentContent) {
        return createErrorResponse("Paramètres manquants pour la vectorisation");
      }
      
      try {
        console.log(`Génération d'embedding pour le document ${documentId}`);
        
        // Génération d'embedding via OpenAI
        const embedding = await generateOpenAIEmbedding(documentContent);
        
        if (!embedding) {
          return createErrorResponse("Échec de la génération d'embedding");
        }
        
        // Préparation des données pour Pinecone
        const pineconeData = {
          id: documentId,
          values: embedding,
          metadata: {
            title: documentTitle || "Sans titre",
            type: documentType || "document",
            chars: documentContent.length
          }
        };
        
        // Essai en cascade pour Pinecone
        let upsertResult;
        let successfulEndpoint = "";
        
        try {
          // Tentative 1: API v1
          console.log(`Tentative d'upsert avec API v1: ${PINECONE_API_V1_URL}`);
          upsertResult = await upsertToPinecone(PINECONE_API_V1_URL, [pineconeData]);
          successfulEndpoint = "v1";
        } catch (error) {
          console.log(`Échec API v1: ${error.message}, tentative API v2...`);
          
          try {
            // Tentative 2: API v2
            upsertResult = await upsertToPinecone(PINECONE_API_V2_URL, [pineconeData]);
            successfulEndpoint = "v2";
          } catch (error2) {
            console.log(`Échec API v2: ${error2.message}, tentative URL directe...`);
            
            // Tentative 3: URL directe
            upsertResult = await upsertToPinecone(PINECONE_DIRECT_URL, [pineconeData]);
            successfulEndpoint = "direct";
          }
        }
        
        console.log(`Vectorisation réussie avec l'endpoint ${successfulEndpoint}`);
        return createSuccessResponse({
          success: true,
          embedding: embedding,
          upsertResult: upsertResult,
          endpoint: successfulEndpoint
        });
      } catch (error) {
        console.error(`Erreur lors de la vectorisation: ${error.message}`);
        // Capturer les détails complets de l'erreur
        const errorDetails = {
          message: error.message,
          stack: error.stack,
          name: error.name,
          // Si c'est une erreur de fetch, inclure le statut et le texte de réponse
          status: error.status || null,
          statusText: error.statusText || null,
          // Si on a une réponse, essayer de l'inclure
          response: error.response ? await error.response.text().catch(() => "Impossible de lire la réponse") : null
        };
        
        return createErrorResponse(`Erreur lors de la vectorisation: ${error.message}`, errorDetails);
      }
    }

    // Action non reconnue
    return createErrorResponse(`Action non reconnue: ${action}`);
    
  } catch (error) {
    console.error(`Erreur générale: ${error.message}`);
    return createErrorResponse(`Erreur générale: ${error.message}`);
  }
});

// Fonction de test de connexion Pinecone
async function testPineconeConnection(baseUrl) {
  try {
    // Requête pour vérifier l'état de l'index
    const url = baseUrl.includes('/indices') 
      ? baseUrl // Pour API v2, l'URL est déjà complète
      : `${baseUrl}/describe_index_stats`; // Pour API v1
      
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        status: response.status,
        statusText: response.statusText,
        error: errorText
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      status: response.status,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
