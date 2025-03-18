
import { KnowledgeEntry } from "../../types";
import { useKnowledgeBaseService } from "../../services";
import { sendMessageToGemini } from "../../../chat/services";
import { searchLocalDocuments } from "../../../chat/services/document/searchService";
import { generateEmbedding } from "../../../chat/services/document/embeddingService";

// Memoize formatter functions with cache to avoid redundant processing
const cachedFormatters = new Map();

export const formatKnowledgeBaseContext = (results: KnowledgeEntry[]) => {
  if (results.length === 0) return { context: "", sources: [] };
  
  // Generate a cache key based on the IDs of entries
  const cacheKey = results.map(entry => entry.id).join('|');
  
  // Return cached result if available
  if (cachedFormatters.has(cacheKey)) {
    return cachedFormatters.get(cacheKey);
  }
  
  // Format structured context for the knowledge base
  const context = "Information de notre base de connaissances :\n\n" + 
    results
      .map((entry, index) => 
        `[Base de connaissances ${index + 1}]\nQuestion: ${entry.question}\nRéponse: ${entry.answer}`)
      .join('\n\n');
  
  // Sources more descriptive
  const sources = results.map(entry => 
    `Base de connaissances: ${entry.question}`
  );
  
  const result = { context, sources };
  
  // Cache the result (limit cache size to avoid memory issues)
  if (cachedFormatters.size > 50) {
    // Remove oldest entry if cache is too large
    const firstKey = cachedFormatters.keys().next().value;
    cachedFormatters.delete(firstKey);
  }
  cachedFormatters.set(cacheKey, result);
  
  return result;
};

export const formatDocumentContext = (docResults: any[]) => {
  if (docResults.length === 0) return { context: "", sources: [] };
  
  // Generate a cache key based on document titles and timestamps
  const cacheKey = docResults.map(doc => 
    `${doc.title || 'untitled'}-${doc.content.length}`
  ).join('|');
  
  // Return cached result if available
  if (cachedFormatters.has(cacheKey)) {
    return cachedFormatters.get(cacheKey);
  }
  
  // Format structured context for documents
  const context = "Information de nos documents :\n\n" + 
    docResults
      .map((doc, index) => 
        `[Document ${index + 1}: ${doc.title || 'Sans titre'}]\n${doc.content.substring(0, 1000)}${doc.content.length > 1000 ? '...' : ''}`)
      .join('\n\n');
  
  // Add document sources
  const sources = docResults.map(doc => 
    `Document: ${doc.title || 'Sans titre'} (Score: ${doc.score?.toFixed(2) || 'N/A'})`
  );
  
  const result = { context, sources };
  
  // Cache the result (limit cache size to avoid memory issues)
  if (cachedFormatters.size > 50) {
    const firstKey = cachedFormatters.keys().next().value;
    cachedFormatters.delete(firstKey);
  }
  cachedFormatters.set(cacheKey, result);
  
  return result;
};

// Optimize search functions to minimize redundant work
export const searchKnowledgeBase = async (kb: ReturnType<typeof useKnowledgeBaseService>, query: string) => {
  const results = await kb.searchEntries(query);
  return formatKnowledgeBaseContext(results);
};

export const searchKnowledgeBaseSemantically = async (kb: ReturnType<typeof useKnowledgeBaseService>, query: string) => {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding) {
      console.error("Could not generate embedding for query");
      return { context: "", sources: [] };
    }
    
    // Search by similarity
    const results = await kb.searchEntriesBySimilarity(queryEmbedding, 0.65, 5);
    
    return formatKnowledgeBaseContext(results);
  } catch (error) {
    console.error("Error in semantic KB search:", error);
    return { context: "", sources: [] };
  }
};

export const searchDocuments = async (query: string) => {
  const results = await searchLocalDocuments(query);
  return formatDocumentContext(results);
};

export const buildPromptForLocalContent = (query: string, hasContext: boolean, context: string) => {
  if (hasContext) {
    return "Analyse soigneusement les informations fournies de notre base de connaissances ET de nos documents locaux, puis utilise-les pour répondre à la question suivante. " +
      "Si les informations sont pertinentes, base ta réponse dessus en priorité. Sinon, utilise tes connaissances générales.\n\n" +
      "Question: " + query;
  }
  return query;
};
