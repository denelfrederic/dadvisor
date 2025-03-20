
/**
 * Service de recherche dans Pinecone
 */

import { PINECONE_API_KEY, getPineconeUrl, PINECONE_INDEX, PINECONE_NAMESPACE } from "../../config.ts";
import { PINECONE_HEADERS, getPineconeOperationUrl } from "./config.ts";
import { logMessage, logError } from "../../utils/logging.ts";

interface SearchOptions {
  threshold?: number;
  limit?: number;
  hybrid?: boolean;
  includeMetadata?: boolean;
  filter?: Record<string, any>;
}

/**
 * Recherche des documents similaires dans Pinecone
 * @param embedding Embedding à rechercher
 * @param options Options de recherche
 * @returns Résultat de la recherche
 */
export async function searchSimilarDocumentsInPinecone(
  embedding: number[],
  options: SearchOptions = {}
): Promise<any> {
  try {
    const {
      threshold = 0.5,
      limit = 5,
      hybrid = false,
      includeMetadata = true,
      filter = {}
    } = options;
    
    console.log(`Recherche dans Pinecone avec seuil: ${threshold}, limite: ${limit}`);
    
    // Vérification de la clé API
    if (!PINECONE_API_KEY) {
      console.error("Clé API Pinecone manquante");
      return {
        success: false,
        error: "Clé API Pinecone manquante"
      };
    }
    
    // Récupération de l'URL Pinecone
    const pineconeUrl = getPineconeUrl();
    if (!pineconeUrl || !pineconeUrl.includes("pinecone.io")) {
      console.error(`URL Pinecone invalide: ${pineconeUrl}`);
      return {
        success: false,
        error: "URL Pinecone invalide",
        details: { url: pineconeUrl }
      };
    }
    
    // Construction de l'URL de requête
    const queryUrl = getPineconeOperationUrl('query');
    console.log(`URL de requête Pinecone: ${queryUrl}`);
    
    // Préparation du corps de la requête
    const requestBody = JSON.stringify({
      vector: embedding,
      topK: limit,
      includeMetadata,
      includeValues: false,
      namespace: PINECONE_NAMESPACE,
      filter: Object.keys(filter).length > 0 ? filter : undefined
    });
    
    console.log(`Namespace: ${PINECONE_NAMESPACE}, Index: ${PINECONE_INDEX}`);
    
    // Envoi de la requête à Pinecone
    try {
      console.log(`Envoi de la requête de recherche à ${queryUrl}...`);
      
      const response = await fetch(queryUrl, {
        method: 'POST',
        headers: PINECONE_HEADERS,
        body: requestBody,
        signal: AbortSignal.timeout(20000) // 20 secondes de timeout
      });
      
      // Traitement de la réponse
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Erreur Pinecone pour query (${response.status}): ${errorText}`);
        
        return {
          success: false,
          error: `Erreur Pinecone: ${response.status} ${errorText}`,
          details: {
            status: response.status,
            bodyText: errorText
          }
        };
      }
      
      const result = await response.json();
      const matches = result.matches || [];
      
      console.log(`${matches.length} résultats trouvés dans Pinecone`);
      
      // Filtrer les résultats par seuil de similarité si nécessaire
      const filteredMatches = threshold > 0
        ? matches.filter((match: any) => match.score >= threshold)
        : matches;
        
      return {
        success: true,
        matches: filteredMatches,
        totalMatches: filteredMatches.length,
        namespace: PINECONE_NAMESPACE,
        queryId: result.id
      };
    } catch (fetchError) {
      console.error(`Erreur lors de la requête à Pinecone: ${fetchError}`);
      
      return {
        success: false,
        error: `Erreur de communication avec Pinecone: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        details: {
          message: fetchError instanceof Error ? fetchError.message : String(fetchError),
          url: queryUrl
        }
      };
    }
  } catch (error) {
    console.error(`Erreur lors de la recherche de documents: ${error}`);
    return {
      success: false,
      error: `Exception: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
