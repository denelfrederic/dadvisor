
export { useKnowledgeBaseService } from './knowledgeBaseService';
export { getKnowledgeBaseStats } from './statsService';

// Export services for direct use when needed
export { useEntryService } from './entry/entryService';
export { useSearchService } from './search/searchService';
export { generateEntryEmbedding } from './embedding/embeddingService';
export { parseEmbedding, processEntryForEmbedding } from './embedding/embeddingUtils';

// Export types
export type { KnowledgeEntry, KnowledgeBaseOperations, KnowledgeBaseStats } from '../types';
