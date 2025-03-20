
/**
 * Gestionnaire pour tester la connexion à Pinecone
 */

import { corsedResponse } from "../utils/response.ts";
import { logMessage, logError } from "../utils/logging.ts";
import { testPineconeConnection } from "../services/pinecone/connection.ts";

/**
 * Gestionnaire pour l'action de test de connexion
 */
export async function handleConnectionTestAction() {
  try {
    logMessage("Test de connexion à Pinecone...", 'info');
    
    // Utiliser le service de test de connexion
    const testResult = await testPineconeConnection();
    
    // Journaliser le résultat du test
    if (testResult.success) {
      logMessage(`Test de connexion réussi: ${testResult.message}`, 'info');
    } else {
      logMessage(`Échec du test de connexion: ${testResult.message}`, 'warn');
    }
    
    // Retourner le résultat avec les entêtes CORS
    return corsedResponse(testResult);
  } catch (error) {
    const errorMsg = logError("Erreur lors du test de connexion à Pinecone", error);
    return corsedResponse({ 
      success: false, 
      error: errorMsg,
      message: "Une erreur interne s'est produite lors du test de connexion"
    }, 500);
  }
}
