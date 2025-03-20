
/**
 * Service pour gérer la configuration Pinecone
 */

import { validateConfig } from "../../config.ts";
import { corsedResponse } from "../../utils/cors.ts";
import { logMessage } from "../../utils/logging.ts";

/**
 * Récupère la configuration Pinecone actuelle
 * @returns Informations de configuration Pinecone
 */
export async function getPineconeConfig() {
  try {
    logMessage("Récupération de la configuration Pinecone", 'info');
    
    // Valider la configuration
    const config = validateConfig();
    
    return corsedResponse(config);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logMessage(`Erreur lors de la récupération de la configuration: ${errorMessage}`, 'error');
    
    return corsedResponse({ 
      success: false, 
      error: errorMessage 
    }, 500);
  }
}
