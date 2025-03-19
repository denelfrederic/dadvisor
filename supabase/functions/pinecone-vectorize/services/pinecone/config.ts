
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
 * Détecte automatiquement le format d'URL Pinecone 
 * entre les anciennes versions et les nouvelles versions Serverless
 * @param url URL de base Pinecone
 * @returns Type d'API Pinecone ('legacy', 'serverless', 'unknown')
 */
export function detectPineconeUrlType(url: string): string {
  // Nettoyage URL
  const cleanUrl = url.trim().replace(/\/+$/, '');
  
  if (cleanUrl.includes('.svc.') && cleanUrl.includes('pinecone.io')) {
    if (cleanUrl.includes('-aped-') || cleanUrl.includes('.serverless.')) {
      console.log("Format URL Pinecone détecté: serverless");
      return 'serverless';
    } else {
      console.log("Format URL Pinecone détecté: legacy");
      return 'legacy';
    }
  }
  
  console.log("Format URL Pinecone non reconnu");
  return 'unknown';
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
  
  // Détection automatique du type d'URL Pinecone
  const apiType = detectPineconeUrlType(normalizedUrl);
  
  // Logging détaillé
  console.log(`Construction de l'URL d'opération: baseUrl=${normalizedUrl}, operation=${operation}, indexName=${indexName}, apiType=${apiType}`);
  
  // Format de l'URL selon le type détecté
  if (apiType === 'serverless') {
    // Pour les API Serverless, utiliser le nouveau format
    const operationUrl = `${normalizedUrl}vectors/${operation}`;
    console.log(`URL générée (serverless): ${operationUrl}`);
    return operationUrl;
  } 
  else if (apiType === 'legacy') {
    // Pour les API legacy, utiliser l'ancien format
    // /vectors/operation
    const operationUrl = `${normalizedUrl}vectors/${operation}`;
    console.log(`URL générée (legacy): ${operationUrl}`);
    return operationUrl;
  }
  else {
    // Format inconnu, essayer l'URL standard (comme avant)
    console.log("Format d'URL inconnu, tentative avec le format standard");
    const operationUrl = `${normalizedUrl}vectors/${operation}`;
    console.log(`URL générée (standard): ${operationUrl}`);
    return operationUrl;
  }
}

/**
 * Diagnostic d'erreurs Pinecone courantes
 * @param status Code de statut HTTP
 * @param message Message d'erreur
 * @returns Diagnostic amélioré
 */
export function diagnosePineconeError(status: number, message: string): string {
  switch (status) {
    case 400:
      return `Requête invalide (400): ${message}. Vérifiez le format des données envoyées à Pinecone.`;
    case 401:
      return `Non autorisé (401): ${message}. Vérifiez votre clé API Pinecone.`;
    case 403:
      return `Accès interdit (403): ${message}. Votre clé API n'a pas les permissions nécessaires ou l'index est inaccessible. Si vous utilisez le plan gratuit, vérifiez que votre index n'est pas en pause.`;
    case 404:
      return `Ressource non trouvée (404): ${message}. Vérifiez que l'index "${getPineconeIndex()}" existe dans votre compte Pinecone et que votre URL est correcte. L'erreur 404 peut indiquer que l'URL Pinecone est incorrecte ou que vous utilisez le mauvais format d'API.`;
    case 429:
      return `Trop de requêtes (429): ${message}. Vous avez dépassé la limite de requêtes de votre compte Pinecone.`;
    case 500:
    case 502:
    case 503:
    case 504:
      return `Erreur serveur Pinecone (${status}): ${message}. Problème temporaire, réessayez plus tard.`;
    default:
      return `Erreur Pinecone (${status}): ${message}`;
  }
}
