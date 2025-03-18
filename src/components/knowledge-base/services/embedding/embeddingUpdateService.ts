
// This file is now just re-exporting from the individual update service files
// to maintain backward compatibility
export { 
  updateEntryEmbeddingBatch,
  updateKnowledgeEntries,
  updateDocuments,
  updateAllEmbeddings
} from './update';
