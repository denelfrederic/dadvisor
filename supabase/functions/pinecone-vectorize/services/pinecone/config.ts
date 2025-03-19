
// Configuration pour les services Pinecone
import { PINECONE_API_KEY, PINECONE_BASE_URL, ALTERNATIVE_PINECONE_URL } from "../../config.ts";

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
  
  if (!PINECONE_BASE_URL) {
    console.error("URL de base Pinecone manquante");
    return false;
  }
  
  return true;
}
