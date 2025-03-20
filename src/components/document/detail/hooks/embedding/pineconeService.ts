
/**
 * Service pour interagir avec Pinecone via les fonctions edge de Supabase
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
  
  addLog(`Début de l'indexation Pinecone pour le document ${document.id} (${document.title})`);
  
  // Pour les documents volumineux, tronquer le contenu
  const maxLength = document.content.length > 15000 ? 6000 : contentLength;
  const truncatedContent = document.content.substring(0, maxLength);
  
  addLog(`Contenu préparé: ${truncatedContent.length}/${document.content.length} caractères`);
  
  // Appeler l'edge function Pinecone
  addLog("Appel à l'API Pinecone via l'edge function...");
  const { data: pineconeData, error: pineconeError } = await supabase.functions.invoke('pinecone-vectorize', {
    body: {
      action: 'vectorize',
      documentId: document.id,
      documentContent: truncatedContent,
      documentTitle: document.title,
      documentType: document.type
    }
  });
  
  if (pineconeError) {
    addLog(`Erreur lors de l'appel à l'API Pinecone: ${pineconeError.message}`);
    throw new Error(`Erreur lors de l'appel à l'API Pinecone: ${pineconeError.message}`);
  }
  
  if (!pineconeData || !pineconeData.success) {
    addLog(`Échec d'indexation avec Pinecone: ${pineconeData?.error || "Erreur inconnue"}`);
    throw new Error(pineconeData?.error || "Échec d'indexation avec Pinecone");
  }
  
  addLog(`Document indexé avec succès dans Pinecone`);
  
  return {
    success: true,
    embedding: pineconeData.embedding,
    logs: logger.logs
  };
};

export const updateDocumentStatus = async (documentId: string, embedding: any) => {
  const { error } = await supabase
    .from('documents')
    .update({ 
      pinecone_indexed: true,
      embedding: embedding
    })
    .eq('id', documentId);
  
  if (error) {
    throw new Error(`Erreur lors de la mise à jour du document: ${error.message}`);
  }
  
  return { success: true };
};
