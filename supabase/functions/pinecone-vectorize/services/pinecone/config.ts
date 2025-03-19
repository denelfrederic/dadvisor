
// Configuration pour les services Pinecone
import { PINECONE_API_KEY, getPineconeUrl, getPineconeIndex } from "../../config.ts";

/**
 * Configurations pour les requêtes Pinecone
 */
export const PINECONE_HEADERS = {
  'Api-Key': PINECONE_API_KEY,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

/**
 * Timeout pour les requêtes Pinecone (30 secondes)
 */
export const REQUEST_TIMEOUT = 30000;

/**
 * Vérifie si la configuration Pinecone est valide
 */
export function validatePineconeConfig(): boolean {
  if (!PINECONE_API_KEY) {
    console.error("Clé API Pinecone manquante");
    return false;
  }
  
  const pineconeUrl = getPineconeUrl();
  if (!pineconeUrl || !pineconeUrl.includes("pinecone")) {
    console.error(`URL Pinecone invalide ou manquante: ${pineconeUrl}`);
    return false;
  }
  
  // Vérifier l'index actuel
  const index = getPineconeIndex();
  console.log(`Index Pinecone utilisé: ${index}`);
  
  return true;
}

/**
 * Obtient l'URL complète pour une opération Pinecone spécifique
 * @param operation L'opération Pinecone (query, upsert, etc.)
 * @returns L'URL complète pour l'opération
 */
export function getPineconeOperationUrl(operation: string): string {
  const baseUrl = getPineconeUrl();
  // S'assurer que l'URL se termine par un slash
  const normalizedUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  
  // Obtenir l'index actuel (celui configuré ou fallback)
  const indexName = getPineconeIndex();
  
  // Logging détaillé
  console.log(`Construction de l'URL d'opération: baseUrl=${normalizedUrl}, operation=${operation}, indexName=${indexName}`);
  
  // Construire l'URL complète avec l'index
  if (indexName) {
    const operationUrl = `${normalizedUrl}vectors/${operation}`;
    console.log(`URL d'opération générée: ${operationUrl}`);
    return operationUrl;
  } else {
    console.warn("Aucun index défini, tentative d'utilisation de l'URL sans spécifier l'index");
    return `${normalizedUrl}${operation}`;
  }
}
