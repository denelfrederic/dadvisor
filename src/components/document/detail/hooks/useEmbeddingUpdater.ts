
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useEmbeddingUpdater = () => {
  const [updatingEmbedding, setUpdatingEmbedding] = useState(false);
  const [updateResult, setUpdateResult] = useState<{success: boolean; message: string} | null>(null);

  // Vectoriser avec Pinecone
  const updateEmbedding = async (document: any) => {
    if (!document || !document.content) return;
    
    setUpdatingEmbedding(true);
    setUpdateResult(null);
    
    try {
      console.log(`Tentative d'indexation Pinecone pour le document ${document.id} (${document.title})`);
      
      // Appeler l'edge function Pinecone
      console.log("Début de l'appel à l'API Pinecone via l'edge function");
      const { data: pineconeData, error: pineconeError } = await supabase.functions.invoke('pinecone-vectorize', {
        body: {
          action: 'vectorize',
          documentId: document.id,
          documentContent: document.content.substring(0, 8000), // Limiter la taille pour éviter les problèmes
          documentTitle: document.title,
          documentType: document.type
        }
      });
      
      if (pineconeError) {
        console.error(`Erreur lors de l'appel à l'API Pinecone:`, pineconeError);
        throw pineconeError;
      }
      
      if (!pineconeData || !pineconeData.success) {
        console.error("Données retournées par Pinecone:", pineconeData);
        throw new Error(pineconeData?.error || "Échec d'indexation avec Pinecone");
      }
      
      console.log(`Document ${document.id} indexé avec succès dans Pinecone:`, pineconeData);
      
      // Mettre à jour le document dans Supabase pour indiquer qu'il est indexé dans Pinecone
      console.log("Mise à jour du document dans Supabase avec pinecone_indexed=true");
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          pinecone_indexed: true,
          embedding: pineconeData.embedding // Stocker également l'embedding pour la compatibilité
        })
        .eq('id', document.id);
      
      if (updateError) {
        console.error(`Erreur lors de la mise à jour du document dans Supabase:`, updateError);
        throw updateError;
      }
      
      console.log(`Document ${document.id} mis à jour avec succès dans Supabase (pinecone_indexed=true)`);
      
      setUpdateResult({
        success: true,
        message: "Document indexé avec succès dans Pinecone"
      });
    } catch (error) {
      console.error("Erreur lors de l'indexation avec Pinecone:", error);
      setUpdateResult({
        success: false,
        message: `Erreur: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setUpdatingEmbedding(false);
    }
  };
  
  // Fonction simplifiée - une seule méthode pour l'indexation
  const fixEmbedding = updateEmbedding;

  return {
    updatingEmbedding,
    updateResult,
    setUpdateResult,
    updateEmbedding,
    fixEmbedding
  };
};
