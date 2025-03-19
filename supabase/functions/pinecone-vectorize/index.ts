
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://deno.land/x/openai@v4.20.1/mod.ts";

// Import configuration
import { 
  OPENAI_API_KEY, 
  validateConfig,
  testPineconeConnection
} from "./config.ts";

// Import Pinecone services
import { 
  upsertToPinecone, 
  queryPinecone 
} from "./services/pinecone/index.ts";

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
  console.log(`Received request: ${req.method} ${req.url}`);
  
  // Gestion CORS pour les requêtes OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validation de la configuration au démarrage
    const configValidation = validateConfig();
    console.log("Configuration validée:", configValidation.valid);
    
    if (!configValidation.valid) {
      return createErrorResponse("Configuration Pinecone invalide: " + configValidation.warnings.join(", "));
    }
    
    // Parse request body
    let reqBody;
    try {
      reqBody = await req.json();
      console.log("Request body action:", reqBody.action);
    } catch (error) {
      console.error("Error parsing request body:", error);
      return createErrorResponse("Invalid request body");
    }
    
    const { action, documentId, documentContent, documentTitle, documentType } = reqBody;

    // Action de vérification de configuration (pour debugging)
    if (action === 'config') {
      return createSuccessResponse(configValidation);
    }
    
    // Action de test de connexion
    if (action === 'test-connection') {
      try {
        console.log("Testing Pinecone connection...");
        const connectionResult = await testPineconeConnection();
        
        console.log("Connection test result:", connectionResult);
        
        return createSuccessResponse(connectionResult);
      } catch (error) {
        console.error("Connection test error:", error);
        return createErrorResponse(`Erreur lors du test de connexion: ${error.message}`, {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Action de vectorisation
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
        const metadata = {
          title: documentTitle || "Sans titre",
          type: documentType || "document",
          chars: documentContent.length
        };
        
        // Upsert to Pinecone
        console.log(`Tentative d'upsert pour le document ${documentId}`);
        const upsertResult = await upsertToPinecone(documentId, embedding, metadata);
        
        console.log(`Vectorisation réussie:`, upsertResult);
        return createSuccessResponse({
          success: true,
          embedding: embedding.slice(0, 5) + "...", // Truncated for response size
          upsertResult: upsertResult
        });
      } catch (error) {
        console.error(`Erreur lors de la vectorisation: ${error.message}`);
        
        // Detailed error information
        const errorDetails = {
          message: error.message,
          stack: error.stack,
          name: error.name
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
