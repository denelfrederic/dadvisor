
import { logWithTimestamp, getPineconeBaseUrl } from './utils.ts';

// Upsert vector to Pinecone
export async function upsertToPinecone(
  id: string, 
  vector: number[], 
  metadata: any, 
  apiKey: string,
  baseUrl: string
) {
  if (!apiKey) {
    throw new Error('Missing Pinecone API key');
  }
  
  logWithTimestamp(`Upserting to Pinecone for document ID: ${id}`, {
    metadata: metadata,
    vectorDimensions: vector.length
  });
  
  try {
    const response = await fetch(`${baseUrl}/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vectors: [
          {
            id,
            values: vector,
            metadata
          }
        ],
        namespace: 'documents' // You can organize your vectors in namespaces
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      logWithTimestamp(`Pinecone API error (${response.status}): ${error}`);
      throw new Error(`Pinecone API error (${response.status}): ${error}`);
    }
    
    const result = await response.json();
    logWithTimestamp(`Pinecone upsert successful:`, result);
    return result;
  } catch (error) {
    logWithTimestamp('Error upserting to Pinecone:', error);
    throw error;
  }
}

// Query vectors from Pinecone
export async function queryPinecone(
  vector: number[], 
  topK: number = 5, 
  apiKey: string,
  baseUrl: string
) {
  if (!apiKey) {
    throw new Error('Missing Pinecone API key');
  }
  
  logWithTimestamp(`Querying Pinecone for ${topK} results`);
  
  try {
    const response = await fetch(`${baseUrl}/query`, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
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
      logWithTimestamp(`Pinecone Query API error (${response.status}): ${error}`);
      throw new Error(`Pinecone API error (${response.status}): ${error}`);
    }
    
    const result = await response.json();
    logWithTimestamp(`Pinecone query successful, ${result.matches?.length || 0} results found`);
    return result;
  } catch (error) {
    logWithTimestamp('Error querying Pinecone:', error);
    throw error;
  }
}
