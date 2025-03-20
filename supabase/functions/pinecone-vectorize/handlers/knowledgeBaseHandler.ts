
/**
 * Gestionnaire pour la recherche dans la base de connaissances
 */

import { corsedResponse } from "../utils/response.ts";
import { logMessage, logError } from "../utils/logging.ts";
import { getPineconeUrl, PINECONE_INDEX, PINECONE_NAMESPACE } from "../config.ts";
import { generateEmbeddingWithOpenAI } from "../services/openai.ts";
import { searchSimilarDocumentsInPinecone } from "../services/pinecone/search.ts";

/**
 * Gestionnaire pour l'action de recherche dans la base de connaissances
 */
export async function handleSearchKnowledgeBaseAction(body: any) {
  try {
    const { query, limit = 5, threshold = 0.5, hybrid = false } = body;
    
    if (!query) {
      logMessage("Requête de recherche manquante", 'error');
      return corsedResponse({ 
        success: false, 
        error: "La requête de recherche est requise" 
      }, 400);
    }
    
    logMessage(`Recherche dans la base de connaissances pour: "${query}"`, 'info');
    
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
    
    // Recherche dans Pinecone
    logMessage(`Recherche de documents similaires dans Pinecone (seuil: ${threshold}, limite: ${limit})...`, 'info');
    const searchResults = await searchSimilarDocumentsInPinecone(embedding, {
      threshold,
      limit,
      hybrid,
      includeMetadata: true
    });
    
    if (!searchResults.success) {
      logMessage(`Échec de la recherche dans Pinecone: ${searchResults.error}`, 'error');
      return corsedResponse({ 
        success: false, 
        error: searchResults.error,
        message: "Erreur lors de la recherche de documents similaires",
        details: searchResults.details || {},
        config: {
          pineconeUrl: getPineconeUrl(),
          pineconeIndex: PINECONE_INDEX,
          namespace: PINECONE_NAMESPACE
        }
      }, 500);
    }
    
    logMessage(`${searchResults.matches.length} résultats trouvés pour la requête`, 'info');
    
    // Transformation des résultats pour le client
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
      query,
      results,
      totalResults: results.length,
      embedding: embedding.slice(0, 5) // Inclure un extrait de l'embedding pour vérification
    });
  } catch (error) {
    const errorMsg = logError("Erreur lors de la recherche dans la base de connaissances", error);
    
    return corsedResponse({ 
      success: false, 
      error: errorMsg,
      query: body?.query || null,
      config: {
        pineconeUrl: getPineconeUrl(),
        pineconeIndex: PINECONE_INDEX,
        namespace: PINECONE_NAMESPACE
      }
    }, 500);
  }
}
