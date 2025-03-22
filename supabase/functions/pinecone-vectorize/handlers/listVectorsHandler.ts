
import { getPineconeUrl, PINECONE_API_KEY, getPineconeIndex } from "../config.ts";
import { PINECONE_HEADERS } from "../services/pinecone/config.ts";
import { logMessage, logError } from "../utils/logging.ts";
import { corsHeaders } from "../utils/cors.ts";
import { createErrorResponse, createSuccessResponse } from "../utils/response.ts";

/**
 * Handler pour lister les vecteurs et métadonnées dans Pinecone
 * @param req La requête HTTP
 * @returns Response avec la liste des vecteurs ou une erreur
 */
export async function handleListVectors(req: Request): Promise<Response> {
  try {
    const { namespace, limit = 10, offset = 0, metadata_filters = null } = await req.json();
    
    // Vérifier si la clé API est disponible
    if (!PINECONE_API_KEY) {
      return createErrorResponse({
        message: "Clé API Pinecone manquante",
        status: 400
      });
    }
    
    // Construire l'URL de requête
    const baseUrl = getPineconeUrl();
    if (!baseUrl) {
      return createErrorResponse({
        message: "URL Pinecone non configurée",
        status: 400
      });
    }
    
    const indexName = getPineconeIndex();
    // Normaliser l'URL de base
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    
    // Construire l'URL de liste
    const listUrl = `${normalizedBaseUrl}vectors/list`;
    
    logMessage(`Envoi de la requête à Pinecone: ${listUrl}`, "info");
    
    // Préparer le corps de la requête
    const requestBody: any = {
      topK: parseInt(String(limit)),
      includeMetadata: true
    };
    
    // Ajouter le namespace si fourni
    if (namespace) {
      requestBody.namespace = namespace;
    }
    
    // Ajouter les filtres de métadonnées si fournis
    if (metadata_filters) {
      requestBody.filter = metadata_filters;
    }
    
    // Effectuer la requête
    const response = await fetch(listUrl, {
      method: "POST",
      headers: PINECONE_HEADERS,
      body: JSON.stringify(requestBody)
    });
    
    // Vérifier le statut HTTP
    if (!response.ok) {
      const errorData = await response.text();
      logMessage(`Erreur de l'API Pinecone: ${response.status} ${response.statusText}`, "error");
      logMessage(`Détails de l'erreur: ${errorData}`, "error");
      
      return createErrorResponse({
        message: `Erreur de l'API Pinecone: ${response.status} ${response.statusText}`,
        details: errorData,
        status: response.status
      });
    }
    
    // Extraire les données de la réponse
    const data = await response.json();
    
    // Journaliser le succès
    logMessage(`Requête de liste Pinecone réussie, ${data.vectors ? Object.keys(data.vectors).length : 0} vecteurs récupérés`, "info");
    
    // Renvoyer les résultats
    return createSuccessResponse({
      vectors: data.vectors || {},
      total: data.vectors ? Object.keys(data.vectors).length : 0,
      namespace: namespace || "default"
    });
  } catch (error) {
    // Journaliser et retourner l'erreur
    const errorMessage = logError("Erreur lors de la requête de liste Pinecone", error);
    return createErrorResponse({
      message: errorMessage,
      status: 500
    });
  }
}
