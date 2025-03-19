
import { logWithTimestamp, getPineconeBaseUrl } from './utils.ts';
import { generateEmbeddingWithOpenAI } from './openai.ts';
import { upsertToPinecone, queryPinecone } from './pinecone.ts';

// Handler for vectorizing a document
export async function handleVectorize(
  reqBody: any, 
  config: { PINECONE_API_KEY: string; OPENAI_API_KEY: string; PINECONE_ENVIRONMENT: string; PINECONE_INDEX: string }
) {
  const { documentId, documentContent, documentTitle, documentType } = reqBody;
  
  // Validate required parameters
  if (!documentContent || !documentId) {
    throw new Error('Missing document content or ID');
  }
  
  logWithTimestamp(`Generating embedding for document: ${documentId}`, {
    title: documentTitle,
    type: documentType,
    contentLength: documentContent.length
  });
  
  // Generate embedding using OpenAI
  const embedding = await generateEmbeddingWithOpenAI(documentContent, config.OPENAI_API_KEY);
  
  // Store in Pinecone with metadata
  const metadata = {
    title: documentTitle || 'Untitled',
    type: documentType || 'unknown',
    contentSnippet: documentContent.slice(0, 300) + '...',
    length: documentContent.length,
    indexed_at: new Date().toISOString(),
  };
  
  const baseUrl = getPineconeBaseUrl(config.PINECONE_ENVIRONMENT, config.PINECONE_INDEX);
  const result = await upsertToPinecone(documentId, embedding, metadata, config.PINECONE_API_KEY, baseUrl);
  
  logWithTimestamp(`Vectorization successful for document: ${documentId}`);
  
  // Return the embedding for storage in Supabase as a backup
  return {
    documentId,
    embedding,
    pineconeResult: result
  };
}

// Handler for querying similar documents
export async function handleQuery(
  reqBody: any,
  config: { PINECONE_API_KEY: string; OPENAI_API_KEY: string; PINECONE_ENVIRONMENT: string; PINECONE_INDEX: string }
) {
  const { query } = reqBody;
  
  if (!query) {
    throw new Error('Missing query text');
  }
  
  logWithTimestamp(`Processing semantic search: "${query}"`);
  
  // Generate embedding for query
  const embedding = await generateEmbeddingWithOpenAI(query, config.OPENAI_API_KEY);
  
  // Query Pinecone for similar documents
  const baseUrl = getPineconeBaseUrl(config.PINECONE_ENVIRONMENT, config.PINECONE_INDEX);
  const results = await queryPinecone(embedding, 5, config.PINECONE_API_KEY, baseUrl);
  
  logWithTimestamp(`${results.matches?.length || 0} results found for query`);
  
  return {
    results: results.matches || []
  };
}
