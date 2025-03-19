
import { useState, useEffect, useCallback } from "react";
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

  const loadDocument = useCallback(async () => {
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
      
      // Vérifier si l'embedding est valide après rechargement
      if (data && data.embedding) {
        console.log(`Document ${documentId} rechargé avec embedding (longueur: ${typeof data.embedding === 'string' ? data.embedding.length : 'non-string'})`);
      } else {
        console.log(`Document ${documentId} rechargé sans embedding`);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du document:", error);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const analyzeDocument = useCallback(async () => {
    if (!documentId) return;
    
    try {
      const result = await analyzeDocumentEmbeddingIssue(documentId);
      setAnalysis(result);
    } catch (error) {
      console.error("Erreur lors de l'analyse du document:", error);
    }
  }, [documentId]);

  useEffect(() => {
    if (isOpen && documentId) {
      loadDocument();
      analyzeDocument();
    } else {
      setDocument(null);
      setAnalysis(null);
      setUpdateResult(null);
    }
  }, [isOpen, documentId, loadDocument, analyzeDocument]);

  // Mise à jour standard de l'embedding
  const updateEmbedding = async () => {
    if (!document || !document.content) return;
    
    setUpdatingEmbedding(true);
    setUpdateResult(null);
    
    try {
      console.log(`Tentative de génération d'embedding standard pour le document ${document.id} (${document.title})`);
      
      // Générer un embedding
      const embedding = await generateEmbedding(document.content, "document");
      
      // Vérifier si l'embedding a été généré
      if (!embedding) {
        throw new Error("Échec de génération de l'embedding");
      }
      
      console.log(`Embedding généré avec succès pour ${document.title}`);
      
      // Convertir l'embedding au format de stockage
      const embeddingForStorage = 
        typeof embedding === 'string' ? embedding : JSON.stringify(embedding);
      
      // Mettre à jour le document
      const { error } = await supabase
        .from('documents')
        .update({ embedding: embeddingForStorage })
        .eq('id', document.id);
      
      if (error) {
        console.error(`Erreur lors de la mise à jour du document dans Supabase:`, error);
        throw error;
      }
      
      console.log(`Document ${document.id} mis à jour avec succès dans Supabase`);
      
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
      console.log(`Tentative de génération optimisée d'embedding pour le document ${documentId}`);
      
      const result = await fixDocumentEmbedding(documentId);
      
      if (result.success) {
        console.log(`Embedding réparé avec succès pour le document ${documentId}`);
      } else {
        console.error(`Échec de la réparation de l'embedding: ${result.message}`);
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

  // Fonction explicite pour recharger le document
  const reloadDocument = useCallback(async () => {
    console.log(`Rechargement explicite du document ${documentId}`);
    await loadDocument();
    await analyzeDocument();
  }, [documentId, loadDocument, analyzeDocument]);

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
