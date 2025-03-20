
import { corsedResponse } from "../utils/response.ts";
import { logMessage, logError } from "../utils/logging.ts";
import { generateEmbeddingWithOpenAI } from "../services/openai.ts";
import { queryPinecone } from "../services/pinecone/query.ts";
import { getPineconeIndex, PINECONE_NAMESPACE } from "../config.ts";

/**
 * Gestionnaire pour l'action de requête Pinecone
 * @param body Corps de la requête contenant les paramètres de recherche
 */
export async function handleQueryAction(body: any) {
  try {
    const { query, topK = 5 } = body;
    
    if (!query) {
      return corsedResponse({
        success: false,
        error: "Requête de recherche manquante"
      }, 400);
    }
    
    logMessage(`Recherche Pinecone pour: "${query.substring(0, 30)}..."`, 'info');
    
    // Générer un embedding pour la requête
    logMessage("Génération de l'embedding pour la requête...", 'info');
    const embedding = await generateEmbeddingWithOpenAI(query);
    
    if (!embedding || embedding.length === 0) {
      return corsedResponse({
        success: false,
        error: "Échec de génération de l'embedding pour la requête"
      }, 500);
    }
    
    // Rechercher dans Pinecone
    logMessage(`Recherche dans Pinecone avec un topK de ${topK}...`, 'info');
    logMessage(`Index Pinecone utilisé: ${getPineconeIndex()}, Namespace: ${PINECONE_NAMESPACE}`, 'info');
    
    const pineconeResults = await queryPinecone(embedding, topK);
    
    if (!pineconeResults || !pineconeResults.matches) {
      return corsedResponse({
        success: true,
        query,
        results: [],
        message: "Aucun résultat trouvé dans Pinecone",
        pineconeIndex: getPineconeIndex(),
        namespace: PINECONE_NAMESPACE,
        timestamp: new Date().toISOString()
      });
    }
    
    // Transformer les résultats
    const results = pineconeResults.matches.map((match: any) => {
      return {
        id: match.id,
        score: match.score,
        metadata: match.metadata || {}
      };
    });
    
    logMessage(`${results.length} résultats trouvés dans Pinecone`, 'info');
    
    return corsedResponse({
      success: true,
      query,
      results,
      pineconeIndex: getPineconeIndex(),
      namespace: PINECONE_NAMESPACE,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMsg = logError("Erreur lors de la recherche Pinecone", error);
    return corsedResponse({
      success: false,
      error: errorMsg
    }, 500);
  }
}
