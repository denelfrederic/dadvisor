
import { searchEntries, getAllEntries } from "./entrySearchService";
import { searchEntriesBySimilarity } from "./embeddingSearchUtils";
import { updateEntryEmbeddingBatch } from "./embeddingUpdateService";

// Hook for compatibility with the knowledge base service
export const useSearchService = () => {
  return {
    searchEntries,
    getEntries: getAllEntries,
    searchEntriesBySimilarity,
    updateEntryEmbeddingBatch
  };
};

// Export individual functions for direct use
export {
  searchEntries,
  getAllEntries,
  searchEntriesBySimilarity,
  updateEntryEmbeddingBatch
};
