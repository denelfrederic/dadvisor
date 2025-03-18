
import { KnowledgeEntry } from "../../types";
import { searchEntries, getAllEntries, searchEntriesBySimilarity } from "./entrySearchService";
import { updateEntryEmbeddingBatch } from "../embedding/embeddingUpdateService";

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
