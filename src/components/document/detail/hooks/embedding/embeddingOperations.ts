
/**
 * Opérations d'embedding (mise à jour standard et alternative)
 */

import { EmbeddableDocument } from "./types";
import { vectorizeDocument, updateDocumentStatus } from "./pineconeService";
import { createEmbeddingLogger } from "./logger";

// Opération standard d'embedding
export const performStandardEmbedding = async (document: EmbeddableDocument) => {
  const logger = createEmbeddingLogger();
  const { addLog } = logger;
  
  try {
    // Vectoriser avec Pinecone (contenu standard)
    const vectorizeResult = await vectorizeDocument(document);
    
    // Mettre à jour le document dans Supabase
    addLog("Mise à jour du document dans Supabase...");
    await updateDocumentStatus(document.id, vectorizeResult.embedding);
    
    addLog(`Document mis à jour avec succès dans Supabase (pinecone_indexed=true)`);
    
    return {
      success: true,
      message: "Document indexé avec succès dans Pinecone",
      logs: logger.logs
    };
  } catch (error) {
    addLog(`Erreur finale: ${error instanceof Error ? error.message : String(error)}`);
    
    return {
      success: false,
      message: `Erreur: ${error instanceof Error ? error.message : String(error)}`,
      logs: logger.logs
    };
  }
};

// Opération d'embedding alternative (avec contenu court)
export const performAlternativeEmbedding = async (document: EmbeddableDocument) => {
  const logger = createEmbeddingLogger();
  const { addLog } = logger;
  
  try {
    addLog(`Tentative d'indexation alternative pour le document ${document.id}`);
    
    // Vectoriser avec un contenu plus court (maximum 4000 caractères)
    const vectorizeResult = await vectorizeDocument(document, 4000);
    
    // Mettre à jour le document dans Supabase
    addLog("Vectorisation alternative réussie, mise à jour Supabase...");
    await updateDocumentStatus(document.id, vectorizeResult.embedding);
    
    addLog("Document mis à jour avec succès");
    
    return {
      success: true,
      message: "Document indexé avec succès via la méthode alternative",
      logs: logger.logs
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    addLog(`Erreur finale: ${errorMessage}`);
    
    return {
      success: false,
      message: `Erreur alternative: ${errorMessage}`,
      logs: logger.logs
    };
  }
};
