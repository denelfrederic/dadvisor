
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateEmbedding } from "../../chat/services/document/embeddingService";
import { analyzeDocumentEmbeddingIssue, fixDocumentEmbedding } from "../report/utils/documentEmbeddingAnalyzer";

export const useDocumentDetail = (documentId: string | null, isOpen: boolean) => {
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [analysis, setAnalysis] = useState<any>(null);
  const [updatingEmbedding, setUpdatingEmbedding] = useState(false);
  const [updateResult, setUpdateResult] = useState<{success: boolean; message: string} | null>(null);

  useEffect(() => {
    if (isOpen && documentId) {
      loadDocument();
      analyzeDocument();
    } else {
      setDocument(null);
      setAnalysis(null);
      setUpdateResult(null);
    }
  }, [isOpen, documentId]);

  const loadDocument = async () => {
    if (!documentId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();
      
      if (error) throw error;
      setDocument(data);
    } catch (error) {
      console.error("Erreur lors du chargement du document:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeDocument = async () => {
    if (!documentId) return;
    
    try {
      const result = await analyzeDocumentEmbeddingIssue(documentId);
      setAnalysis(result);
    } catch (error) {
      console.error("Erreur lors de l'analyse du document:", error);
    }
  };

  // Mise à jour standard de l'embedding
  const updateEmbedding = async () => {
    if (!document || !document.content) return;
    
    setUpdatingEmbedding(true);
    setUpdateResult(null);
    
    try {
      // Générer un embedding
      const embedding = await generateEmbedding(document.content, "document");
      
      // Vérifier si l'embedding a été généré
      if (!embedding) {
        throw new Error("Échec de génération de l'embedding");
      }
      
      // Convertir l'embedding au format de stockage
      const embeddingForStorage = 
        typeof embedding === 'string' ? embedding : JSON.stringify(embedding);
      
      // Mettre à jour le document
      const { error } = await supabase
        .from('documents')
        .update({ embedding: embeddingForStorage })
        .eq('id', document.id);
      
      if (error) throw error;
      
      // Recharger le document
      loadDocument();
      
      setUpdateResult({
        success: true,
        message: "Embedding généré et enregistré avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'embedding:", error);
      setUpdateResult({
        success: false,
        message: `Erreur: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setUpdatingEmbedding(false);
    }
  };
  
  // Réparation optimisée pour les cas difficiles
  const fixEmbedding = async () => {
    if (!documentId) return;
    
    setUpdatingEmbedding(true);
    setUpdateResult(null);
    
    try {
      const result = await fixDocumentEmbedding(documentId);
      
      if (result.success) {
        // Recharger le document pour voir les changements
        await loadDocument();
      }
      
      setUpdateResult(result);
    } catch (error) {
      console.error("Erreur lors de la réparation de l'embedding:", error);
      setUpdateResult({
        success: false,
        message: `Erreur: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setUpdatingEmbedding(false);
    }
  };

  return {
    document,
    loading,
    activeTab,
    analysis,
    updatingEmbedding,
    updateResult,
    setActiveTab,
    updateEmbedding,
    fixEmbedding
  };
};
