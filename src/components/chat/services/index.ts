
// Export message service
export * from './messageService';

// Export Gemini service
export * from './geminiService';

// Export document services, but re-export getDocumentStats explicitly to avoid ambiguity
export * from './document/documentProcessor';
export * from './document/documentUtils';
export * from './document/embeddingService';
export * from './document/searchService';
export { getDocumentStats } from './document/documentManagement';
export * from './document/documentManagement';
