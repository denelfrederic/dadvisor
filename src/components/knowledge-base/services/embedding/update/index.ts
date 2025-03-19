
// Export entry update services
export { updateEntryEmbedding, updateEntriesEmbeddings, updateKnowledgeEntries } from './entry';
export { processBatchEmbeddings as updateEntryEmbeddingBatch } from './entry/batchService';
export { updateDocuments, updateDocumentEmbeddings } from './document';
export { updateAllEmbeddings } from './combinedUpdateService';
