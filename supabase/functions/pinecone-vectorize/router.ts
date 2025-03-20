
import { logMessage, logError } from "./utils/logging.ts";
import { corsedResponse } from "./utils/response.ts";
import { validateConfig } from "./config.ts";
import { corsHeaders } from "./_shared/cors.ts";

// Importation des gestionnaires d'action
import { handleConfigAction } from "./handlers/configHandler.ts";
import { handleConnectionTestAction } from "./handlers/connectionHandler.ts";
import { handleVectorizeAction } from "./handlers/vectorizeHandler.ts";
import { handleOpenAICheckAction, handleGenerateEmbeddingAction } from "./handlers/openaiHandler.ts";

/**
 * Router principal pour distribuer les requêtes aux handlers appropriés
 */
export async function routeRequest(req: Request) {
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
    
    // Router vers le handler approprié en fonction de l'action
    switch (action) {
      case 'config':
        return await handleConfigAction();
        
      case 'test-connection':
        return await handleConnectionTestAction();
        
      case 'vectorize':
        return await handleVectorizeAction(body);
        
      case 'check-openai':
        return await handleOpenAICheckAction();
        
      case 'generate-embedding':
        return await handleGenerateEmbeddingAction(body);
        
      default:
        logMessage(`Action inconnue: ${action}`, 'error');
        return corsedResponse({ success: false, error: "Action inconnue" }, 400);
    }
  } catch (error) {
    const errorMsg = logError("Erreur inattendue", error);
    return corsedResponse({ 
      success: false, 
      error: errorMsg
    }, 500);
  }
}
