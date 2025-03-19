
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.5";
import { generateEmbeddingWithOpenAI } from "./services/openai.ts";
import { testPineconeConnection, getPineconeConfig, indexDocumentInPinecone } from "./services/pinecone/index.ts";

// Importation de nos services OpenAI
import { checkOpenAIStatus, generateTestEmbedding } from "./services/openai.ts";
import { validateConfig, getPineconeIndex } from "./config.ts";

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
  const requestTime = new Date().toISOString();
  console.log(`[${requestTime}] Requête reçue: ${req.method} ${req.url}`);
  
  // Gérer les requêtes OPTIONS (CORS)
  if (req.method === "OPTIONS") {
    console.log("Réponse OPTIONS pour CORS");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Récupérer les données de la requête
    const requestData = await req.json().catch(error => {
      console.error("Erreur lors de la lecture du corps de la requête:", error);
      return { action: null };
    });
    
    const { action, ...body } = requestData;

    // Vérifier si une action est spécifiée
    if (!action) {
      console.error("Action manquante dans la requête");
      return corsedResponse({ success: false, error: "Action manquante" }, 400);
    }
    
    console.log(`[${new Date().toISOString()}] Traitement de l'action "${action}"...`);
    
    // Traiter les différentes actions
    if (action === 'config') {
      try {
        console.log("Récupération de la configuration Pinecone...");
        const config = await getPineconeConfig();
        console.log("Configuration récupérée avec succès:", config);
        return corsedResponse(config);
      } catch (error) {
        console.error("Erreur lors de la récupération de la configuration Pinecone:", error);
        return corsedResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        }, 500);
      }
    }
    
    if (action === 'test-connection') {
      try {
        console.log("Test de connexion à Pinecone...");
        console.log(`Index Pinecone utilisé pour le test: ${getPineconeIndex()}`);
        const connectionStatus = await testPineconeConnection();
        console.log("Résultat du test de connexion:", connectionStatus);
        return corsedResponse(connectionStatus);
      } catch (error) {
        console.error("Erreur lors du test de connexion à Pinecone:", error);
        return corsedResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        }, 500);
      }
    }
    
    if (action === 'vectorize') {
      try {
        const { documentId, documentContent, documentTitle, documentType } = body;
        
        if (!documentId || !documentContent) {
          console.error("Document ID ou contenu manquant");
          return corsedResponse({ 
            success: false, 
            error: "Document ID et contenu sont requis" 
          }, 400);
        }
        
        console.log(`[${new Date().toISOString()}] Indexation du document ${documentId}...`);
        console.log(`Index Pinecone utilisé pour l'indexation: ${getPineconeIndex()}`);
        const indexResult = await indexDocumentInPinecone(
          documentId, 
          documentContent,
          { title: documentTitle, type: documentType }
        );
        
        if (!indexResult.success) {
          console.error(`Échec de l'indexation du document ${documentId}:`, indexResult.error);
          return corsedResponse(indexResult, 500);
        }
        
        console.log(`Document ${documentId} indexé avec succès`);
        return corsedResponse({ 
          success: true, 
          message: "Document indexé avec succès dans Pinecone",
          embedding: indexResult.embedding
        });
      } catch (error) {
        console.error("Erreur lors de l'indexation du document dans Pinecone:", error);
        return corsedResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        }, 500);
      }
    }
    
    // Actions pour OpenAI
    if (action === 'check-openai') {
      try {
        console.log("Vérification de la configuration OpenAI...");
        const status = await checkOpenAIStatus();
        console.log("Statut OpenAI:", status);
        
        // Ajouter des informations sur Pinecone également
        const pineconeConfig = validateConfig();
        const effectiveIndex = getPineconeIndex();
        
        return corsedResponse({
          ...status,
          pineconeConfig: {
            ...pineconeConfig.config,
            effectiveIndex: effectiveIndex,
            warnings: pineconeConfig.warnings
          }
        });
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
          console.error("Texte manquant pour la génération d'embedding");
          return corsedResponse({ 
            success: false, 
            error: "Le texte est requis pour générer un embedding" 
          }, 400);
        }
        
        console.log(`[${new Date().toISOString()}] Génération de l'embedding pour le texte: "${text.substring(0, 30)}..."`);
        const result = await generateTestEmbedding(text);
        
        if (!result.success) {
          console.error("Échec de la génération d'embedding:", result.error);
          return corsedResponse(result, 500);
        }
        
        console.log("Embedding généré avec succès");
        return corsedResponse({ 
          success: true, 
          embedding: result.embedding,
          model: result.modelName,
          dimensions: result.embedding.length,
          usage: result.usage
        });
      } catch (error) {
        console.error("Erreur lors de la génération de l'embedding de test:", error);
        return corsedResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        }, 500);
      }
    }
    
    console.error(`Action inconnue: ${action}`);
    return corsedResponse({ success: false, error: "Action inconnue" }, 400);
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return corsedResponse({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});
