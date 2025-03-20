
/**
 * Gestionnaire pour le test de connexion à Pinecone
 */

import { corsedResponse } from "../utils/response.ts";
import { logMessage, logError } from "../utils/logging.ts";
import { testPineconeConnection } from "../services/pinecone/connection.ts";

/**
 * Gestionnaire pour l'action de test de connexion
 */
export async function handleTestConnectionAction(requestData: any) {
  try {
    logMessage("Test de la connexion à Pinecone", 'info');
    
    // Effectuer le test de connexion à Pinecone
    const testResult = await testPineconeConnection();
    
    // Ajouter des informations de traçage à la réponse
    const enhancedResult = {
      ...testResult,
      timestamp: new Date().toISOString()
    };
    
    // Journaliser le résultat
    if (testResult.success) {
      logMessage(`Test de connexion Pinecone réussi`, 'info');
    } else {
      logMessage(`Échec du test de connexion Pinecone: ${testResult.message || "Raison inconnue"}`, 'error');
    }
    
    return corsedResponse(enhancedResult);
  } catch (error) {
    const errorMsg = logError("Erreur lors du test de connexion à Pinecone", error);
    return corsedResponse({
      success: false,
      error: errorMsg
    }, 500);
  }
}
