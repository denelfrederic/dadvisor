
import { useState, useCallback } from "react";
import { useDocumentLoader } from "./hooks/useDocumentLoader";
import { useDocumentAnalyzer } from "./hooks/useDocumentAnalyzer";
import { useEmbeddingUpdater } from "./hooks/useEmbeddingUpdater";

export const useDocumentDetail = (documentId: string | null, isOpen: boolean) => {
  const [activeTab, setActiveTab] = useState("info");
  
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

  // Wrapper pour fixEmbedding qui utilise le documentId actuel
  const fixEmbedding = useCallback(async () => {
    if (documentId) {
      await fixDocumentEmbedding(documentId);
    }
  }, [documentId, fixDocumentEmbedding]);

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
    reloadDocument
  };
};
