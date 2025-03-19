import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "@supabase/supabase-js";
import { generateEmbeddingWithOpenAI } from "./services/openai.ts";
import { testPineconeConnection, getPineconeConfig, indexDocumentInPinecone } from "./services/pinecone.ts";

// Importation de nos services OpenAI
import { checkOpenAIStatus, generateTestEmbedding } from "./services/openai.ts";

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? ""
);

const corsedResponse = (response: any, status = 200) => {
  return new Response(JSON.stringify(response), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, ...body } = await req.json();

    if (!action) {
      return corsedResponse({ success: false, error: "Action manquante" }, 400);
    }
    
    if (action === 'config') {
      try {
        const config = await getPineconeConfig();
        return corsedResponse(config);
      } catch (error) {
        console.error("Erreur lors de la récupération de la configuration Pinecone:", error);
        return corsedResponse({ success: false, error: error instanceof Error ? error.message : String(error) }, 500);
      }
    }
    
    if (action === 'test-connection') {
      try {
        const connectionStatus = await testPineconeConnection();
        return corsedResponse(connectionStatus);
      } catch (error) {
        console.error("Erreur lors du test de connexion à Pinecone:", error);
        return corsedResponse({ success: false, error: error instanceof Error ? error.message : String(error) }, 500);
      }
    }
    
    if (action === 'vectorize') {
      try {
        const { documentId, documentContent, documentTitle, documentType } = body;
        
        if (!documentId || !documentContent) {
          return corsedResponse({ success: false, error: "Document ID et contenu sont requis" }, 400);
        }
        
        const indexResult = await indexDocumentInPinecone(documentId, documentContent, documentTitle, documentType);
        
        if (!indexResult.success) {
          return corsedResponse(indexResult, 500);
        }
        
        return corsedResponse({ 
          success: true, 
          message: "Document indexé avec succès dans Pinecone",
          embedding: indexResult.embedding
        });
      } catch (error) {
        console.error("Erreur lors de l'indexation du document dans Pinecone:", error);
        return corsedResponse({ success: false, error: error instanceof Error ? error.message : String(error) }, 500);
      }
    }
    
    // Ajoutez ces blocs de code pour gérer les nouvelles actions
    if (action === 'check-openai') {
      try {
        const status = await checkOpenAIStatus();
        return corsedResponse(status);
      } catch (error) {
        console.error("Erreur lors de la vérification de la configuration OpenAI:", error);
        return corsedResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        }, 500);
      }
    }

    if (action === 'generate-embedding') {
      try {
        const { text } = body;
        
        if (!text) {
          return corsedResponse({ 
            success: false, 
            error: "Le texte est requis pour générer un embedding" 
          }, 400);
        }
        
        const result = await generateTestEmbedding(text);
        return corsedResponse({ 
          success: true, 
          embedding: result.embedding,
          model: result.modelName,
          dimensions: result.embedding.length
        });
      } catch (error) {
        console.error("Erreur lors de la génération de l'embedding de test:", error);
        return corsedResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        }, 500);
      }
    }
    
    return corsedResponse({ success: false, error: "Action inconnue" }, 400);
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return corsedResponse({ success: false, error: error instanceof Error ? error.message : String(error) }, 500);
  }
});
