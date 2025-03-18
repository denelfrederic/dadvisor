
// Types for the knowledge base
export interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  source?: string; // Source of the document (filename)
  timestamp?: number; // Date added
}
