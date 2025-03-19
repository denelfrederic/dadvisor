
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
      if (data && (data.embedding || data.pinecone_indexed)) {
        console.log(`Document ${documentId} rechargé avec vectorisation`);
      } else {
        console.log(`Document ${documentId} rechargé sans vectorisation`);
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

  // Vectoriser avec Pinecone
  const updateEmbedding = async () => {
    if (!document || !document.content) return;
    
    setUpdatingEmbedding(true);
    setUpdateResult(null);
    
    try {
      console.log(`Tentative de vectorisation avec Pinecone pour le document ${document.id} (${document.title})`);
      
      // Appeler l'edge function Pinecone
      const { data: pineconeData, error: pineconeError } = await supabase.functions.invoke('pinecone-vectorize', {
        body: {
          action: 'vectorize',
          documentId: document.id,
          documentContent: document.content,
          documentTitle: document.title,
          documentType: document.type
        }
      });
      
      if (pineconeError) {
        console.error(`Erreur lors de l'appel à l'API Pinecone:`, pineconeError);
        throw pineconeError;
      }
      
      if (!pineconeData.success) {
        throw new Error(pineconeData.error || "Échec de vectorisation avec Pinecone");
      }
      
      console.log(`Document ${document.id} vectorisé avec succès dans Pinecone`);
      
      // Mettre à jour le document dans Supabase pour indiquer qu'il est indexé dans Pinecone
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
      
      console.log(`Document ${document.id} mis à jour avec succès dans Supabase`);
      
      setUpdateResult({
        success: true,
        message: "Document vectorisé et indexé avec succès dans Pinecone"
      });
    } catch (error) {
      console.error("Erreur lors de la vectorisation avec Pinecone:", error);
      setUpdateResult({
        success: false,
        message: `Erreur: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setUpdatingEmbedding(false);
    }
  };
  
  // Réparation optimisée avec Pinecone pour les cas difficiles
  const fixEmbedding = async () => {
    if (!documentId) return;
    
    setUpdatingEmbedding(true);
    setUpdateResult(null);
    
    try {
      console.log(`Tentative de vectorisation optimisée avec Pinecone pour le document ${documentId}`);
      
      // Récupérer le document complet pour avoir accès au contenu
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();
        
      if (documentError || !documentData) {
        throw new Error(`Erreur lors de la récupération du document: ${documentError?.message || "Document non trouvé"}`);
      }
      
      // Tronquer le contenu pour les documents volumineux
      const truncatedContent = documentData.content.substring(0, 8000);
      
      // Appeler l'edge function Pinecone avec le contenu tronqué
      const { data: pineconeData, error: pineconeError } = await supabase.functions.invoke('pinecone-vectorize', {
        body: {
          action: 'vectorize',
          documentId: documentData.id,
          documentContent: truncatedContent,
          documentTitle: documentData.title,
          documentType: documentData.type
        }
      });
      
      if (pineconeError) {
        console.error(`Erreur lors de l'appel à l'API Pinecone:`, pineconeError);
        throw pineconeError;
      }
      
      if (!pineconeData.success) {
        throw new Error(pineconeData.error || "Échec de vectorisation optimisée avec Pinecone");
      }
      
      // Mettre à jour le document dans Supabase
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          pinecone_indexed: true,
          // Stocker également l'embedding pour la compatibilité avec les fonctions existantes
          embedding: pineconeData.embedding
        })
        .eq('id', documentData.id);
      
      if (updateError) {
        console.error(`Erreur lors de la mise à jour du document dans Supabase:`, updateError);
        throw updateError;
      }
      
      console.log(`Document ${documentId} vectorisé avec contenu tronqué et indexé dans Pinecone`);
      
      setUpdateResult({
        success: true,
        message: "Document vectorisé avec succès en utilisant une version tronquée du contenu"
      });
    } catch (error) {
      console.error("Erreur lors de la vectorisation optimisée:", error);
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
