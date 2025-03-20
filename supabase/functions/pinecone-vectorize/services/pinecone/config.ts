
/**
 * Configuration pour les services Pinecone
 */

import { PINECONE_API_KEY, getPineconeUrl } from "../../config.ts";
import { logMessage } from "../../utils/logging.ts";

// En-têtes pour les requêtes Pinecone
export const PINECONE_HEADERS = {
  "Content-Type": "application/json",
  "Api-Key": PINECONE_API_KEY || ""
};

/**
 * Détermine le type d'API Pinecone en fonction de l'URL
 * @param url URL Pinecone
 * @returns Type d'API ("serverless" | "legacy" | "unknown")
 */
export function detectPineconeUrlType(url: string): string {
  if (!url) return "unknown";
  
  if (url.includes("pinecone.io/v1/")) {
    return "serverless";
  } else if (url.includes("svc.pinecone.io")) {
    return "legacy";
  }
  
  // Par défaut, considérer comme serverless (nouvelle API)
  return "unknown";
}

/**
 * Obtient l'URL d'opération Pinecone en fonction du type d'API
 * @param operationType Type d'opération ("query", "upsert", "delete", "fetch", etc.)
 * @returns URL complète pour l'opération spécifiée
 */
export function getPineconeOperationUrl(operationType: string): string {
  const baseUrl = getPineconeUrl();
  
  if (!baseUrl) {
    logMessage("URL Pinecone manquante pour l'opération", "error");
    return "";
  }
  
  // Normaliser l'URL de base
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  
  // Construire l'URL d'opération
  return `${normalizedBaseUrl}${operationType}`;
}
