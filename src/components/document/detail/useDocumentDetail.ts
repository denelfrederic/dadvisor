
import { useState, useCallback } from "react";
import { useDocumentLoader } from "./hooks/useDocumentLoader";
import { useDocumentAnalyzer } from "./hooks/useDocumentAnalyzer";
import { useEmbeddingUpdater } from "./hooks/useEmbeddingUpdater";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useDocumentDetail = (documentId: string | null, isOpen: boolean) => {
  const [activeTab, setActiveTab] = useState("info");
  const { toast } = useToast();
  
  const { document, loading, loadDocument } = useDocumentLoader(documentId, isOpen);
  const { analysis, analyzeDocument } = useDocumentAnalyzer(documentId, isOpen);
  const { 
    updatingEmbedding, 
    updateResult, 
    setUpdateResult,
    updateEmbedding: updateDocumentEmbedding, 
    fixEmbedding: fixDocumentEmbedding 
  } = useEmbeddingUpdater();

  // Fonction explicite pour recharger le document
  const reloadDocument = useCallback(async () => {
    console.log(`Rechargement explicite du document ${documentId}`);
    await loadDocument();
    await analyzeDocument();
  }, [documentId, loadDocument, analyzeDocument]);

  // Wrapper pour updateEmbedding qui utilise le document actuel
  const updateEmbedding = useCallback(async () => {
    if (document) {
      await updateDocumentEmbedding(document);
    }
  }, [document, updateDocumentEmbedding]);

  // Wrapper pour fixEmbedding qui utilise le document actuel
  const fixEmbedding = useCallback(async () => {
    if (document) {
      await fixDocumentEmbedding(document);
    }
  }, [document, fixDocumentEmbedding]);

  // Nouvelle fonction pour synchroniser le statut Pinecone
  const syncPineconeStatus = useCallback(async () => {
    if (!document || !documentId) return;
    
    try {
      console.log(`Synchronisation du statut Pinecone pour le document ${documentId}`);
      toast({
        title: "Synchronisation...",
        description: "Mise à jour du statut Pinecone en cours"
      });
      
      // Fix: Utiliser directement "true" au lieu de la valeur du document pour forcer la mise à jour
      const { error } = await supabase
        .from('documents')
        .update({ pinecone_indexed: true })
        .eq('id', documentId);
      
      if (error) throw error;
      
      toast({
        title: "Synchronisation réussie",
        description: "Le document est maintenant marqué comme indexé dans Pinecone"
      });
      
      // Recharger les données
      await reloadDocument();
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);
      toast({
        title: "Erreur",
        description: `Échec de la synchronisation: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    }
  }, [documentId, document, toast, reloadDocument]);

  return {
    document,
    loading,
    activeTab,
    analysis,
    updatingEmbedding,
    updateResult,
    setActiveTab,
    updateEmbedding,
    fixEmbedding,
    reloadDocument,
    syncPineconeStatus
  };
};
