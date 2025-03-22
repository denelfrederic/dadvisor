
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
    // Gérer les requêtes OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Extraire les paramètres de la requête
    const body = await req.json();
    const { namespace, limit = 10, offset = 0, metadata_filters = null } = body;
    
    logMessage(`Requête list-vectors reçue avec limit=${limit}, namespace=${namespace || "default"}`, "info");
    
    // Vérifier si la clé API est disponible
    if (!PINECONE_API_KEY) {
      const errorMsg = "Clé API Pinecone manquante dans la configuration";
      logMessage(errorMsg, "error");
      return createErrorResponse({
        message: errorMsg,
        status: 400,
        headers: corsHeaders
      });
    }
    
    // Construire l'URL de requête
    const baseUrl = getPineconeUrl();
    if (!baseUrl) {
      const errorMsg = "URL Pinecone non configurée";
      logMessage(errorMsg, "error");
      return createErrorResponse({
        message: errorMsg,
        status: 400,
        headers: corsHeaders
      });
    }
    
    const indexName = getPineconeIndex();
    logMessage(`Utilisation de l'index Pinecone: ${indexName}`, "info");
    
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
      logMessage(`Namespace spécifié: ${namespace}`, "info");
    }
    
    // Ajouter les filtres de métadonnées si fournis
    if (metadata_filters) {
      requestBody.filter = metadata_filters;
      logMessage(`Filtres de métadonnées appliqués: ${JSON.stringify(metadata_filters)}`, "info");
    }
    
    // Préparer les en-têtes avec CORS
    const headers = {
      ...PINECONE_HEADERS,
      'Content-Type': 'application/json'
    };
    
    logMessage(`En-têtes de la requête: ${JSON.stringify(headers)}`, "debug");
    logMessage(`Corps de la requête: ${JSON.stringify(requestBody)}`, "debug");
    
    // Utiliser un timeout pour éviter que la requête ne reste bloquée
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 secondes de timeout
    
    try {
      // Effectuer la requête avec un abort signal
      const response = await fetch(listUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      // Annuler le timeout
      clearTimeout(timeoutId);
      
      // Vérifier le statut HTTP
      if (!response.ok) {
        const errorData = await response.text();
        logMessage(`Erreur de l'API Pinecone: ${response.status} ${response.statusText}`, "error");
        logMessage(`Détails de l'erreur: ${errorData}`, "error");
        
        return createErrorResponse({
          message: `Erreur de l'API Pinecone: ${response.status} ${response.statusText}`,
          details: errorData,
          status: response.status,
          headers: corsHeaders
        });
      }
      
      // Extraire les données de la réponse
      const data = await response.json();
      
      // Journaliser le succès
      const vectorCount = data.vectors ? Object.keys(data.vectors).length : 0;
      logMessage(`Requête de liste Pinecone réussie, ${vectorCount} vecteurs récupérés`, "info");
      
      // Renvoyer les résultats
      return createSuccessResponse({
        vectors: data.vectors || {},
        total: vectorCount,
        namespace: namespace || "default"
      }, { headers: corsHeaders });
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Gérer spécifiquement les erreurs de timeout
      if (fetchError.name === 'AbortError') {
        logMessage("La requête à Pinecone a expiré après 15 secondes", "error");
        return createErrorResponse({
          message: "Timeout: La requête à Pinecone a expiré après 15 secondes",
          status: 504, // Gateway Timeout
          headers: corsHeaders
        });
      }
      
      // Autres erreurs fetch
      throw fetchError;
    }
    
  } catch (error) {
    // Journaliser et retourner l'erreur
    const errorMessage = logError("Erreur lors de la requête de liste Pinecone", error);
    return createErrorResponse({
      message: errorMessage,
      status: 500,
      headers: corsHeaders
    });
  }
}
