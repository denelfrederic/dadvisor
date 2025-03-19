
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.5";
import { generateEmbeddingWithOpenAI } from "./services/openai.ts";
import { testPineconeConnection, getPineconeConfig, indexDocumentInPinecone } from "./services/pinecone/index.ts";

// Importation de nos services OpenAI
import { checkOpenAIStatus, generateTestEmbedding } from "./services/openai.ts";
import { validateConfig, getPineconeIndex } from "./config.ts";
import { logMessage, logError } from "./utils/logging.ts";

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? ""
);

const corsedResponse = (response: any, status =
200) => {
  return new Response(JSON.stringify(response), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};

serve(async (req: Request) => {
  const requestTime = new Date().toISOString();
  logMessage(`Requête reçue: ${req.method} ${req.url}`, 'info');
  
  // Gérer les requêtes OPTIONS (CORS)
  if (req.method === "OPTIONS") {
    logMessage("Réponse OPTIONS pour CORS", 'info');
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Récupérer les données de la requête
    const requestData = await req.json().catch(error => {
      logMessage(`Erreur lors de la lecture du corps de la requête: ${error}`, 'error');
      return { action: null };
    });
    
    const { action, ...body } = requestData;

    // Vérifier si une action est spécifiée
    if (!action) {
      logMessage("Action manquante dans la requête", 'error');
      return corsedResponse({ success: false, error: "Action manquante" }, 400);
    }
    
    logMessage(`Traitement de l'action "${action}"...`, 'info');
    
    // Vérification préalable de la configuration
    const configCheck = validateConfig();
    if (!configCheck.valid) {
      logMessage(`Configuration invalide: ${configCheck.warnings.join(", ")}`, 'warn');
      
      // Pour certaines actions critiques, bloquer en cas de configuration invalide
      if (action === 'vectorize') {
        return corsedResponse({
          success: false,
          error: `Configuration invalide: ${configCheck.warnings.join(", ")}`,
          config: configCheck.config,
          timestamp: new Date().toISOString()
        }, 500);
      }
    }
    
    // Traiter les différentes actions
    if (action === 'config') {
      try {
        logMessage("Récupération de la configuration Pinecone...", 'info');
        const config = await getPineconeConfig();
        logMessage("Configuration récupérée avec succès", 'info');
        return corsedResponse(config);
      } catch (error) {
        const errorMsg = logError("Erreur lors de la récupération de la configuration Pinecone", error);
        return corsedResponse({ 
          success: false, 
          error: errorMsg
        }, 500);
      }
    }
    
    if (action === 'test-connection') {
      try {
        logMessage("Test de connexion à Pinecone...", 'info');
        logMessage(`Index Pinecone utilisé pour le test: ${getPineconeIndex()}`, 'info');
        const connectionStatus = await testPineconeConnection();
        logMessage(`Résultat du test de connexion: ${connectionStatus.success ? "Succès" : "Échec"}`, connectionStatus.success ? 'info' : 'error');
        return corsedResponse(connectionStatus);
      } catch (error) {
        const errorMsg = logError("Erreur lors du test de connexion à Pinecone", error);
        return corsedResponse({ 
          success: false, 
          error: errorMsg
        }, 500);
      }
    }
    
    if (action === 'vectorize') {
      try {
        const { documentId, documentContent, documentTitle, documentType } = body;
        
        if (!documentId || !documentContent) {
          logMessage("Document ID ou contenu manquant", 'error');
          return corsedResponse({ 
            success: false, 
            error: "Document ID et contenu sont requis" 
          }, 400);
        }
        
        logMessage(`Indexation du document ${documentId}...`, 'info');
        logMessage(`Index Pinecone utilisé pour l'indexation: ${getPineconeIndex()}`, 'info');
        
        // Avant d'indexer, vérifier la configuration
        if (!configCheck.valid) {
          const errorDetails = `Configuration Pinecone invalide: ${configCheck.warnings.join("; ")}`;
          logMessage(errorDetails, 'error');
          return corsedResponse({
            success: false,
            error: errorDetails,
            config: configCheck.config,
            documentId
          }, 500);
        }
        
        const indexResult = await indexDocumentInPinecone(
          documentId, 
          documentContent,
          { title: documentTitle, type: documentType }
        );
        
        if (!indexResult.success) {
          logMessage(`Échec de l'indexation du document ${documentId}: ${indexResult.error}`, 'error');
          return corsedResponse(indexResult, 500);
        }
        
        logMessage(`Document ${documentId} indexé avec succès`, 'info');
        return corsedResponse({ 
          success: true, 
          message: "Document indexé avec succès dans Pinecone",
          embedding: indexResult.embedding
        });
      } catch (error) {
        const errorMsg = logError("Erreur lors de l'indexation du document dans Pinecone", error);
        return corsedResponse({ 
          success: false, 
          error: errorMsg
        }, 500);
      }
    }
    
    // Actions pour OpenAI
    if (action === 'check-openai') {
      try {
        logMessage("Vérification de la configuration OpenAI...", 'info');
        const status = await checkOpenAIStatus();
        logMessage(`Statut OpenAI: ${status.success ? "OK" : "Erreur"}`, status.success ? 'info' : 'error');
        
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
        const errorMsg = logError("Erreur lors de la vérification de la configuration OpenAI", error);
        return corsedResponse({ 
          success: false, 
          error: errorMsg
        }, 500);
      }
    }

    if (action === 'generate-embedding') {
      try {
        const { text } = body;
        
        if (!text) {
          logMessage("Texte manquant pour la génération d'embedding", 'error');
          return corsedResponse({ 
            success: false, 
            error: "Le texte est requis pour générer un embedding" 
          }, 400);
        }
        
        logMessage(`Génération de l'embedding pour le texte: "${text.substring(0, 30)}..."`, 'info');
        const result = await generateTestEmbedding(text);
        
        if (!result.success) {
          logMessage(`Échec de la génération d'embedding: ${result.error}`, 'error');
          return corsedResponse(result, 500);
        }
        
        logMessage("Embedding généré avec succès", 'info');
        return corsedResponse({ 
          success: true, 
          embedding: result.embedding,
          model: result.modelName,
          dimensions: result.embedding.length,
          usage: result.usage
        });
      } catch (error) {
        const errorMsg = logError("Erreur lors de la génération de l'embedding de test", error);
        return corsedResponse({ 
          success: false, 
          error: errorMsg
        }, 500);
      }
    }
    
    logMessage(`Action inconnue: ${action}`, 'error');
    return corsedResponse({ success: false, error: "Action inconnue" }, 400);
  } catch (error) {
    const errorMsg = logError("Erreur inattendue", error);
    return corsedResponse({ 
      success: false, 
      error: errorMsg
    }, 500);
  }
});
