
// Service pour interagir avec Pinecone

import { PINECONE_API_KEY, PINECONE_BASE_URL, ALTERNATIVE_PINECONE_URL, PINECONE_INDEX } from "../config.ts";
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
      namespace: 'documents' // Organisation en namespaces
    };
    
    // Logs détaillés pour le debugging
    logMessage(`Tentative d'insertion à l'URL: ${PINECONE_BASE_URL}/vectors/upsert`);
    
    // Requête avec un timeout plus long (30 secondes)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(`${PINECONE_BASE_URL}/vectors/upsert`, {
        method: 'POST',
        headers: {
          'Api-Key': PINECONE_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(vectorData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Capturer le texte de la réponse pour debugging
      const responseText = await response.text();
      
      if (!response.ok) {
        // Logging détaillé de l'erreur
        logMessage(`Erreur API Pinecone (${response.status}): ${responseText}`, "error");
        
        // Essai avec URL alternative
        logMessage("Première tentative échouée, essai avec une URL alternative...", "warn");
        return await tryAlternativePineconeStructure(vectorData);
      }
      
      const result = responseText ? JSON.parse(responseText) : {};
      logMessage(`Insertion Pinecone réussie`);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      logError("Erreur lors de la première tentative d'insertion", error);
      
      // Essai avec URL alternative en cas d'erreur
      logMessage("Tentative avec structure alternative suite à une exception...", "warn");
      return await tryAlternativePineconeStructure(vectorData);
    }
  } catch (error) {
    logError('Error upserting to Pinecone', error);
    throw error;
  }
}

/**
 * Tentative avec une structure Pinecone alternative
 * Cette méthode utilise un format de requête différent compatible avec certaines versions de l'API Pinecone
 */
async function tryAlternativePineconeStructure(vectorData: any): Promise<any> {
  // Format de payload alternatif pour les nouvelles versions de l'API
  const alternativePayload = {
    upsertRequest: {
      vectors: vectorData.vectors,
      namespace: vectorData.namespace
    }
  };
  
  logMessage(`Tentative avec URL alternative: ${ALTERNATIVE_PINECONE_URL}/upsert`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  try {
    const response = await fetch(`${ALTERNATIVE_PINECONE_URL}/upsert`, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(alternativePayload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const responseText = await response.text();
    logMessage(`Réponse alternative (${response.status}): ${responseText.substring(0, 500)}`);
    
    if (!response.ok) {
      logMessage(`Alternative également échouée (${response.status}): ${responseText}`, "error");
      
      // En dernier recours, tenter une troisième structure d'URL
      logMessage("Dernière tentative avec structure d'API legacy...", "warn");
      return await tryLegacyPineconeEndpoint(vectorData);
    }
    
    const result = responseText ? JSON.parse(responseText) : {};
    logMessage("Tentative alternative réussie!");
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    logError("Erreur lors de la tentative alternative", error);
    
    // Dernier essai avec structure legacy
    return await tryLegacyPineconeEndpoint(vectorData);
  }
}

/**
 * Dernière tentative avec un endpoint legacy de Pinecone
 */
async function tryLegacyPineconeEndpoint(vectorData: any): Promise<any> {
  // Format compatible avec les anciennes versions de l'API
  const legacyUrl = `https://api.pinecone.io/v1/vectors/upsert?environment=${PINECONE_INDEX}`;
  
  logMessage(`Dernière tentative avec URL legacy: ${legacyUrl}`);
  
  try {
    const response = await fetch(legacyUrl, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vectorData),
    });
    
    const responseText = await response.text();
    logMessage(`Réponse legacy (${response.status}): ${responseText.substring(0, 500)}`);
    
    if (!response.ok) {
      logMessage(`Tentative legacy également échouée (${response.status}): ${responseText}`, "error");
      throw new Error(`Toutes les tentatives d'insertion dans Pinecone ont échoué (${response.status}): ${responseText}`);
    }
    
    const result = responseText ? JSON.parse(responseText) : {};
    logMessage("Tentative legacy réussie!");
    return result;
  } catch (error) {
    logError("Échec de toutes les tentatives d'insertion dans Pinecone", error);
    throw new Error(`Échec de toutes les tentatives d'insertion dans Pinecone: ${error instanceof Error ? error.message : String(error)}`);
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
        'Accept': 'application/json',
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

