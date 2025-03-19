
// Service pour interagir avec Pinecone

import { PINECONE_API_KEY, PINECONE_BASE_URL, ALTERNATIVE_PINECONE_URL } from "../config.ts";
import { logMessage, logError, logVectorInfo } from "../utils/logging.ts";

/**
 * Insère un vecteur dans Pinecone
 */
export async function upsertToPinecone(id: string, vector: number[], metadata: any): Promise<any> {
  if (!PINECONE_API_KEY) {
    logMessage("Clé API Pinecone manquante", "error");
    throw new Error('Missing Pinecone API key');
  }
  
  logMessage(`Insertion dans Pinecone pour document ID: ${id}, avec metadata: ${JSON.stringify(metadata)}`);
  logMessage(`URL d'insertion Pinecone: ${PINECONE_BASE_URL}/vectors/upsert`);
  logVectorInfo(id, vector);
  
  try {
    const vectorData = {
      vectors: [
        {
          id,
          values: vector,
          metadata
        }
      ],
      namespace: 'documents' // Vous pouvez organiser vos vecteurs en namespaces
    };
    
    // Logs détaillés pour le debugging
    logMessage(`Headers: Api-Key: ${PINECONE_API_KEY ? "Présente (masquée)" : "Manquante!"}, Content-Type: application/json`);
    logMessage(`Corps de la requête (début): ${JSON.stringify(vectorData).substring(0, 200)}...`);
    
    // Requête avec un timeout plus long (30 secondes)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(`${PINECONE_BASE_URL}/vectors/upsert`, {
        method: 'POST',
        headers: {
          'Api-Key': PINECONE_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vectorData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Capturer le texte de la réponse pour debugging
      const responseText = await response.text();
      logMessage(`Réponse Pinecone (${response.status}): ${responseText.substring(0, 500)}`);
      
      if (!response.ok) {
        // Logging détaillé de l'erreur
        logMessage(`Erreur API Pinecone (${response.status}): ${responseText}`, "error");
        logMessage(`URL utilisée: ${PINECONE_BASE_URL}/vectors/upsert`, "error");
        
        // Essai avec URL alternative
        logMessage("Première tentative échouée, essai avec une configuration alternative...", "warn");
        return await tryAlternativePineconeUrl(vectorData);
      }
      
      const result = responseText ? JSON.parse(responseText) : {};
      logMessage(`Insertion Pinecone réussie:`);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      logError("Erreur lors de la première tentative d'insertion", error);
      
      // Essai avec URL alternative en cas d'erreur
      logMessage("Tentative avec URL alternative suite à une exception...", "warn");
      return await tryAlternativePineconeUrl(vectorData);
    }
  } catch (error) {
    logError('Error upserting to Pinecone', error);
    throw error;
  }
}

/**
 * Tentative avec une URL Pinecone alternative
 */
async function tryAlternativePineconeUrl(vectorData: any): Promise<any> {
  const alternativeUrl = `${ALTERNATIVE_PINECONE_URL}/vectors/upsert`;
  logMessage(`Tentative avec URL alternative: ${alternativeUrl}`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  try {
    const response = await fetch(alternativeUrl, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vectorData),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const responseText = await response.text();
    logMessage(`Réponse alternative (${response.status}): ${responseText.substring(0, 500)}`);
    
    if (!response.ok) {
      logMessage(`Alternative également échouée (${response.status}): ${responseText}`, "error");
      throw new Error(`Alternative également échouée (${response.status}): ${responseText}`);
    }
    
    const result = responseText ? JSON.parse(responseText) : {};
    logMessage("Tentative alternative réussie!");
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    logError("Erreur lors de la tentative alternative", error);
    throw error;
  }
}

/**
 * Recherche dans Pinecone
 */
export async function queryPinecone(vector: number[], topK = 5): Promise<any> {
  if (!PINECONE_API_KEY) {
    logMessage("Clé API Pinecone manquante", "error");
    throw new Error('Missing Pinecone API key');
  }
  
  logMessage(`Recherche dans Pinecone pour ${topK} résultats`);
  
  try {
    const response = await fetch(`${PINECONE_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vector,
        topK,
        includeMetadata: true,
        namespace: 'documents'
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      logMessage(`Erreur API Pinecone Query (${response.status}): ${error}`, "error");
      throw new Error(`Pinecone API error: ${error}`);
    }
    
    const result = await response.json();
    logMessage(`Recherche Pinecone réussie, ${result.matches?.length || 0} résultats trouvés`);
    return result;
  } catch (error) {
    logError('Error querying Pinecone', error);
    throw error;
  }
}
