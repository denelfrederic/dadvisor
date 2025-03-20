
/**
 * Types pour la gestion des embeddings
 */

// Résultat d'une opération d'embedding
export interface EmbeddingUpdateResult {
  success: boolean;
  message: string;
}

// Document avec les champs minimum nécessaires pour l'embedding
export interface EmbeddableDocument {
  id: string;
  title: string;
  content?: string;
  type?: string;
}
