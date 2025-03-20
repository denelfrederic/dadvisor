
/**
 * Gestionnaire pour la recherche dans la base de connaissances
 */

import { corsedResponse } from "../utils/response.ts";
import { logMessage, logError } from "../utils/logging.ts";
import { querySimilarDocuments } from "../services/pinecone/query.ts";
import { validateConfig } from "../config.ts";

/**
 * Gestionnaire pour l'action de recherche dans la base de connaissances
 */
export async function handleSearchKnowledgeBaseAction(requestData: any) {
  try {
    const { query, maxResults = 5, threshold = 0.7 } = requestData;
    
    if (!query) {
      return corsedResponse({
        success: false,
        error: "Requête vide. Un paramètre 'query' est requis."
      }, 400);
    }
    
    logMessage(`Recherche dans la base de connaissances: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`, 'info');
    
    // Vérifier la configuration Pinecone
    const configCheck = validateConfig();
    if (!configCheck.valid) {
      return corsedResponse({
        success: false,
        error: `Configuration Pinecone invalide: ${configCheck.warnings.join("; ")}`,
        config: configCheck.config
      }, 500);
    }
    
    // Effectuer la recherche
    const searchResults = await querySimilarDocuments(query, maxResults, threshold);
    
    return corsedResponse({
      success: true,
      results: searchResults,
      query,
      maxResults,
      threshold
    });
  } catch (error) {
    const errorMsg = logError("Erreur lors de la recherche dans la base de connaissances", error);
    return corsedResponse({
      success: false,
      error: errorMsg
    }, 500);
  }
}
