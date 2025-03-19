
// Pinecone vector database operations (insert, query)

import { PINECONE_API_KEY, PINECONE_BASE_URL } from "./config.ts";

// Upsert vector to Pinecone
export async function upsertToPinecone(id: string, vector: number[], metadata: any) {
  if (!PINECONE_API_KEY) {
    console.error("Clé API Pinecone manquante");
    throw new Error('Missing Pinecone API key');
  }
  
  console.log(`Insertion dans Pinecone pour document ID: ${id}, avec metadata: ${JSON.stringify(metadata)}`);
  console.log(`URL Pinecone: ${PINECONE_BASE_URL}/vectors/upsert`);
  
  try {
    const vectorData = {
      vectors: [
        {
          id,
          values: vector,
          metadata
        }
      ],
      namespace: 'documents' // You can organize your vectors in namespaces
    };
    
    console.log(`Envoi de données à Pinecone: ${JSON.stringify(vectorData).substring(0, 200)}...`);
    
    const response = await fetch(`${PINECONE_BASE_URL}/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vectorData),
    });
    
    const responseText = await response.text();
    console.log(`Réponse Pinecone (${response.status}): ${responseText}`);
    
    if (!response.ok) {
      console.error(`Erreur API Pinecone (${response.status}): ${responseText}`);
      throw new Error(`Pinecone API error (${response.status}): ${responseText}`);
    }
    
    const result = responseText ? JSON.parse(responseText) : {};
    console.log(`Insertion Pinecone réussie:`, result);
    return result;
  } catch (error) {
    console.error('Error upserting to Pinecone:', error);
    throw error;
  }
}

// Query vectors from Pinecone
export async function queryPinecone(vector: number[], topK = 5) {
  if (!PINECONE_API_KEY) {
    console.error("Clé API Pinecone manquante");
    throw new Error('Missing Pinecone API key');
  }
  
  console.log(`Recherche dans Pinecone pour ${topK} résultats`);
  
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
      console.error(`Erreur API Pinecone Query (${response.status}): ${error}`);
      throw new Error(`Pinecone API error: ${error}`);
    }
    
    const result = await response.json();
    console.log(`Recherche Pinecone réussie, ${result.matches?.length || 0} résultats trouvés`);
    return result;
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    throw error;
  }
}
