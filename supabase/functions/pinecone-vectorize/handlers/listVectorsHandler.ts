
import { corsHeaders } from "../utils/cors.ts";
import { PINECONE_API_KEY, getPineconeUrl, getPineconeIndex, PINECONE_NAMESPACE } from "../config.ts";
import { logMessage, logError } from "../utils/logging.ts";
import { createSuccessResponse, createErrorResponse } from "../utils/response.ts";
import { getPineconeOperationUrl, PINECONE_HEADERS, detectPineconeUrlType } from "../services/pinecone/config.ts";

// Délai d'expiration pour les requêtes vers Pinecone (15 secondes)
const PINECONE_TIMEOUT = 15000;

/**
 * Gère la requête pour lister les vecteurs dans Pinecone
 * @param req La requête HTTP
 * @returns Response avec la liste des vecteurs ou une erreur
 */
export async function handleListVectors(req: Request): Promise<Response> {
  try {
    logMessage("Traitement de la requête listVectors", "info");
    
    // Extraire les paramètres de la requête
    const { limit = 20, metadata_filters = null } = await req.json();
    
    // Vérifier les paramètres requis
    if (!PINECONE_API_KEY) {
      logError("Clé API Pinecone manquante", new Error("PINECONE_API_KEY not set"));
      return createErrorResponse({
        message: "Clé API Pinecone manquante dans la configuration",
        status: 500
      });
    }
    
    // Récupérer l'URL et l'index Pinecone
    const pineconeUrl = getPineconeUrl();
    const indexName = getPineconeIndex();
    const namespace = PINECONE_NAMESPACE;
    
    if (!pineconeUrl) {
      logError("URL Pinecone manquante", new Error("PINECONE_BASE_URL not set"));
      return createErrorResponse({
        message: "URL Pinecone manquante dans la configuration",
        status: 500
      });
    }
    
    logMessage(`Récupération des vecteurs depuis Pinecone (limite: ${limit})`, "info");
    logMessage(`URL Pinecone: ${pineconeUrl}`, "debug");
    logMessage(`Index: ${indexName}`, "debug");
    logMessage(`Namespace: ${namespace}`, "debug");
    
    try {
      // Créer un AbortController pour gérer le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), PINECONE_TIMEOUT);
      
      // Déterminer le type d'API Pinecone (serverless ou legacy)
      const apiType = detectPineconeUrlType(pineconeUrl);
      logMessage(`Type d'API Pinecone détecté: ${apiType}`, "info");
      
      // Construire l'URL pour la requête en fonction du type d'API
      const operationUrl = getPineconeOperationUrl(pineconeUrl, indexName, apiType, "query");
      logMessage(`URL de l'opération: ${operationUrl}`, "debug");
      
      // Configurer les paramètres de la requête
      const body: any = {
        topK: limit,
        includeMetadata: true,
        namespace: namespace
      };
      
      // Ajouter les filtres de métadonnées si fournis
      if (metadata_filters) {
        body.filter = { metadata: metadata_filters };
      }
      
      // Exécuter la requête avec un timeout
      const response = await fetch(operationUrl, {
        method: "POST",
        headers: PINECONE_HEADERS,
        body: JSON.stringify(body),
        signal: controller.signal
      });
      
      // Annuler le timeout
      clearTimeout(timeoutId);
      
      // Traiter la réponse
      if (!response.ok) {
        const errorText = await response.text();
        logError(`Erreur Pinecone (${response.status}): ${errorText}`, new Error(`Pinecone API error: ${response.status}`));
        
        return createErrorResponse({
          message: `Erreur lors de la récupération des vecteurs depuis Pinecone: ${response.status} ${response.statusText}`,
          status: response.status,
          details: errorText
        });
      }
      
      // Analyser la réponse JSON
      const data = await response.json();
      logMessage(`Réponse Pinecone reçue, nombre de correspondances: ${data.matches?.length || 0}`, "info");
      
      return createSuccessResponse({
        vectors: data.matches.reduce((acc: any, match: any) => {
          acc[match.id] = {
            score: match.score,
            metadata: match.metadata || {}
          };
          return acc;
        }, {}),
        count: data.matches.length,
        totalCount: data.matches.length
      });
      
    } catch (fetchError) {
      // Vérifier si l'erreur est due à un timeout
      if (fetchError.name === "AbortError") {
        logError("Timeout lors de la requête à Pinecone", new Error("Pinecone request timeout"));
        return createErrorResponse({
          message: "La requête à Pinecone a expiré après 15 secondes",
          status: 504,
          details: "Vérifiez que votre index Pinecone est actif et répond correctement"
        });
      }
      
      // Autres erreurs de fetch
      logError(`Erreur lors de l'appel à l'API Pinecone: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`, fetchError);
      return createErrorResponse({
        message: `Erreur lors de l'appel à l'API Pinecone: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
        status: 500
      });
    }
    
  } catch (error) {
    // Capturer et loguer toute autre erreur
    logError(`Exception non gérée dans listVectorsHandler: ${error instanceof Error ? error.message : String(error)}`, error);
    return createErrorResponse({
      message: `Exception non gérée dans listVectorsHandler: ${error instanceof Error ? error.message : String(error)}`,
      status: 500
    });
  }
}
