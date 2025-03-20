
/**
 * Gestionnaire pour les requêtes de configuration
 */

import { corsedResponse } from "../utils/response.ts";
import { logMessage, logError } from "../utils/logging.ts";
import { validateConfig } from "../config.ts";
import { testPineconeConnection } from "../services/pinecone/connection.ts";
import { getPineconeConfig } from "../services/pinecone/index.ts";

/**
 * Gestionnaire pour l'action de récupération de configuration
 */
export async function handleConfigAction() {
  try {
    logMessage("Récupération de la configuration", 'info');
    
    // Appeler le service de configuration
    const configResponse = await getPineconeConfig();
    return configResponse;
  } catch (error) {
    const errorMsg = logError("Erreur lors de la récupération de la configuration", error);
    return corsedResponse({
      success: false,
      error: errorMsg
    }, 500);
  }
}
