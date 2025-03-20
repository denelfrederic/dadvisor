
import { getPineconeConfig } from "../services/pinecone/index.ts";
import { logMessage, logError } from "../utils/logging.ts";
import { corsedResponse } from "../utils/response.ts";

/**
 * Gestionnaire pour l'action de configuration
 */
export async function handleConfigAction() {
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
