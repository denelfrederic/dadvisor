
import { KnowledgeBaseOperations } from "../types";
import { useEntryService } from "./entry/entryService";
import { useSearchService } from "./search/searchService";
import { generateEntryEmbedding } from "./embedding/embeddingService";

/**
 * Main service that combines all knowledge base operations
 * This service maintains the same API as before but delegates to specialized services
 */
export const useKnowledgeBaseService = (): KnowledgeBaseOperations => {
  const entryService = useEntryService();
  const searchService = useSearchService();

  return {
    // Entry management operations
    addEntry: entryService.addEntry,
    updateEntry: entryService.updateEntry,
    deleteEntry: entryService.deleteEntry,
    
    // Search and retrieval operations
    getEntries: searchService.getEntries,
    searchEntries: searchService.searchEntries,
    searchEntriesBySimilarity: searchService.searchEntriesBySimilarity,
    
    // Embedding operations
    generateEmbedding: generateEntryEmbedding
  };
};
