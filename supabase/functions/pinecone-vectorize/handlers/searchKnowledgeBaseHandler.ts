
/**
 * Gestionnaire pour la recherche dans la base de connaissances
 */

import { corsedResponse } from "../utils/response.ts";
import { logMessage, logError } from "../utils/logging.ts";
import { generateEmbeddingWithOpenAI } from "../services/openai.ts";
import { searchSimilarDocumentsInPinecone } from "../services/pinecone/search.ts";
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
    
    // Générer l'embedding pour la requête
    logMessage("Génération de l'embedding pour la requête...", 'info');
    const embedding = await generateEmbeddingWithOpenAI(query);
    
    if (!embedding) {
      logMessage("Échec de la génération de l'embedding pour la requête", 'error');
      return corsedResponse({ 
        success: false, 
        error: "Impossible de générer l'embedding pour la requête" 
      }, 500);
    }
    
    // Effectuer la recherche dans Pinecone
    const searchOptions = {
      threshold,
      limit: maxResults,
      includeMetadata: true
    };
    
    const searchResults = await searchSimilarDocumentsInPinecone(embedding, searchOptions);
    
    if (!searchResults.success) {
      return corsedResponse({
        success: false,
        error: searchResults.error || "Erreur lors de la recherche dans Pinecone",
        details: searchResults.details || {}
      }, 500);
    }
    
    // Transformer les résultats pour le client
    const results = searchResults.matches.map((match: any) => {
      const metadata = match.metadata || {};
      
      return {
        id: match.id,
        question: metadata.question || "",
        answer: metadata.answer || metadata.text || "",
        source: metadata.source || "Inconnu",
        similarity: match.score
      };
    });
    
    return corsedResponse({
      success: true,
      results,
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
