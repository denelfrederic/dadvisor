
import { testPineconeConnection } from "../services/pinecone/index.ts";
import { getPineconeIndex } from "../config.ts";
import { logMessage, logError } from "../utils/logging.ts";
import { corsedResponse } from "../utils/response.ts";

/**
 * Gestionnaire pour l'action de test de connexion
 */
export async function handleConnectionTestAction() {
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
