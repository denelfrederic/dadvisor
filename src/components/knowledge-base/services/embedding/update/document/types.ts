
// Types pour les services de mise à jour des documents
export interface DocumentUpdateResult {
  success: boolean;
  count?: number;
  error?: string;
}

export interface DocumentForIndexing {
  id: string;
  title: string;
  content: string;
  type?: string;
  pinecone_indexed?: boolean | null;
}

export type LogCallback = (message: string) => void;
