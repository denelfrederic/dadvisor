
/**
 * Service pour les requêtes de recherche Pinecone
 */

import { getPineconeUrl, PINECONE_API_KEY, getPineconeIndex } from "../../config.ts";
import { PINECONE_HEADERS } from "./config.ts";
import { logMessage, logError } from "../../utils/logging.ts";

/**
 * Options pour les requêtes Pinecone
 */
interface PineconeQueryOptions {
  namespace?: string;
  vector: number[];
  topK: number;
  includeMetadata?: boolean;
  includeValues?: boolean;
  filter?: Record<string, any>;
}

/**
 * Effectue une requête de recherche vectorielle dans Pinecone
 * @param options Options de la requête Pinecone
 * @returns Résultats de la requête
 */
export async function performPineconeQuery(options: PineconeQueryOptions) {
  try {
    const {
      namespace,
      vector,
      topK = 10,
      includeMetadata = true,
      includeValues = false,
      filter = {}
    } = options;
    
    // Vérifier si la clé API est disponible
    if (!PINECONE_API_KEY) {
      logMessage("Clé API Pinecone manquante pour la requête", "error");
      return {
        success: false,
        error: "Clé API Pinecone non configurée"
      };
    }
    
    // Construire l'URL de requête
    const baseUrl = getPineconeUrl();
    const indexName = getPineconeIndex();
    
    if (!baseUrl) {
      logMessage("URL Pinecone manquante pour la requête", "error");
      return {
        success: false,
        error: "URL Pinecone non configurée"
      };
    }
    
    // Normaliser l'URL de base
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    
    // Construire l'URL complète de la requête
    const queryUrl = `${normalizedBaseUrl}query`;
    
    logMessage(`Envoi de la requête à Pinecone: ${queryUrl}`, "info");
    
    // Préparer le corps de la requête
    const requestBody: any = {
      vector,
      topK,
      includeMetadata,
      includeValues
    };
    
    // Ajouter le namespace si fourni
    if (namespace) {
      requestBody.namespace = namespace;
    }
    
    // Ajouter le filtre si fourni
    if (Object.keys(filter).length > 0) {
      requestBody.filter = filter;
    }
    
    // Effectuer la requête
    const response = await fetch(queryUrl, {
      method: "POST",
      headers: PINECONE_HEADERS,
      body: JSON.stringify(requestBody)
    });
    
    // Vérifier le statut HTTP
    if (!response.ok) {
      const errorData = await response.text();
      logMessage(`Erreur de l'API Pinecone: ${response.status} ${response.statusText}`, "error");
      logMessage(`Détails de l'erreur: ${errorData}`, "error");
      
      return {
        success: false,
        error: `Erreur de l'API Pinecone: ${response.status} ${response.statusText}`,
        details: errorData,
        status: response.status
      };
    }
    
    // Extraire les données de la réponse
    const data = await response.json();
    
    // Vérifier la structure de la réponse
    if (!data || !data.matches) {
      logMessage("Format de réponse Pinecone invalide", "error");
      return {
        success: false,
        error: "Format de réponse Pinecone invalide",
        responseData: data
      };
    }
    
    // Journaliser les résultats
    logMessage(`Requête Pinecone réussie avec ${data.matches.length} résultats`, "info");
    
    // Renvoyer les résultats
    return {
      success: true,
      matches: data.matches,
      namespace: namespace,
      count: data.matches.length
    };
  } catch (error) {
    // Journaliser et retourner l'erreur
    const errorMessage = logError("Erreur lors de la requête Pinecone", error);
    return {
      success: false,
      error: errorMessage
    };
  }
}
