
// Service pour la recherche de vecteurs dans Pinecone
import { PINECONE_API_KEY, PINECONE_BASE_URL } from "../../config.ts";
import { PINECONE_HEADERS, validatePineconeConfig } from "./config.ts";

/**
 * Recherche dans Pinecone
 * @param vector Vecteur d'embedding pour la recherche
 * @param topK Nombre de résultats à retourner
 */
export async function queryPinecone(vector: number[], topK = 5): Promise<any> {
  if (!validatePineconeConfig()) {
    throw new Error('Configuration Pinecone invalide');
  }
  
  console.log(`Recherche dans Pinecone pour ${topK} résultats`);
  
  try {
    const response = await fetch(`${PINECONE_BASE_URL}/query`, {
      method: 'POST',
      headers: PINECONE_HEADERS,
      body: JSON.stringify({
        vector,
        topK,
        includeMetadata: true,
        namespace: 'documents'
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`Erreur API Pinecone Query (${response.status}): ${error}`);
      throw new Error(`Pinecone API error: ${error}`);
    }
    
    const result = await response.json();
    console.log(`Recherche Pinecone réussie, ${result.matches?.length || 0} résultats trouvés`);
    return result;
  } catch (error) {
    console.error('Error querying Pinecone', error instanceof Error ? error.message : String(error));
    throw error;
  }
}
