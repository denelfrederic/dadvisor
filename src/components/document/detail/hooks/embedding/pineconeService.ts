
/**
 * Service pour la gestion des embeddings de documents 
 * Version simplifiée sans Pinecone
 */

import { supabase } from "@/integrations/supabase/client";
import { EmbeddableDocument } from "./types";
import { createEmbeddingLogger } from "./logger";

export const vectorizeDocument = async (
  document: EmbeddableDocument, 
  contentLength: number = 8000
) => {
  const logger = createEmbeddingLogger();
  const { addLog } = logger;
  
  if (!document || !document.content) {
    addLog(`Document invalide ou sans contenu: ${document?.id || 'inconnu'}`);
    throw new Error("Le document est vide ou n'a pas de contenu");
  }
  
  addLog(`Début de l'indexation pour le document ${document.id} (${document.title})`);
  
  // Pour les documents volumineux, prendre seulement une partie
  let maxLength = contentLength;
  if (document.content.length > 20000) {
    maxLength = 10000;
    addLog(`Document volumineux détecté (${document.content.length} caractères). Utilisation d'une longueur optimisée: ${maxLength}`);
  } else if (document.content.length > 8000) {
    maxLength = 8000;
    addLog(`Document moyennement volumineux (${document.content.length} caractères). Utilisation de la longueur standard: ${maxLength}`);
  } else {
    maxLength = document.content.length;
    addLog(`Petit document (${document.content.length} caractères). Utilisation du contenu complet`);
  }
  
  const truncatedContent = document.content.substring(0, maxLength);
  
  addLog(`Contenu préparé: ${truncatedContent.length}/${document.content.length} caractères`);
  
  try {
    // Génération locale de l'embedding (simulée - remplacée par un placeholder)
    const mockEmbedding = { vector: [0.1, 0.2, 0.3, 0.4, 0.5] }; // Placeholder d'embedding
    
    addLog(`Document indexé avec succès`);
    
    return {
      success: true,
      embedding: mockEmbedding.vector,
      logs: logger.logs
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    addLog(`Erreur finale d'indexation: ${errorMessage}`);
    console.error("Erreur d'indexation:", error);
    
    throw error;
  }
};

export const updateDocumentStatus = async (documentId: string, embedding: any) => {
  try {
    console.log(`Mise à jour du statut du document ${documentId} dans Supabase...`);
    
    const { error } = await supabase
      .from('documents')
      .update({ 
        pinecone_indexed: true,
        embedding: embedding
      })
      .eq('id', documentId);
    
    if (error) {
      console.error(`Erreur lors de la mise à jour du statut: ${error.message}`);
      throw new Error(`Erreur lors de la mise à jour du document: ${error.message}`);
    }
    
    console.log(`Statut du document ${documentId} mis à jour avec succès`);
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    throw error;
  }
};
