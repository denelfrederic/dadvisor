
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
      console.log(`Tentative de vectorisation avec Pinecone pour le document ${document.id} (${document.title})`);
      
      // Appeler l'edge function Pinecone avec des logs améliorés
      console.log("Début de l'appel à l'API Pinecone via l'edge function");
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
      
      if (!pineconeData || !pineconeData.success) {
        console.error("Données retournées par Pinecone:", pineconeData);
        throw new Error(pineconeData?.error || "Échec de vectorisation avec Pinecone");
      }
      
      console.log(`Document ${document.id} vectorisé avec succès dans Pinecone:`, pineconeData);
      
      // Vérifier si l'embedding est présent
      if (!pineconeData.embedding) {
        console.warn("L'API Pinecone n'a pas retourné d'embedding");
      }
      
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
  const fixEmbedding = async (documentId: string) => {
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
      console.log(`Contenu tronqué de ${documentData.content.length} à ${truncatedContent.length} caractères`);
      
      // Appeler l'edge function Pinecone avec le contenu tronqué
      console.log("Appel à l'API Pinecone avec contenu tronqué");
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
        console.error("Réponse de l'API Pinecone:", pineconeData);
        throw new Error(pineconeData.error || "Échec de vectorisation optimisée avec Pinecone");
      }
      
      console.log("Vectorisation réussie avec Pinecone:", pineconeData);
      
      // Mettre à jour le document dans Supabase
      console.log("Mise à jour du document dans Supabase");
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

  return {
    updatingEmbedding,
    updateResult,
    setUpdateResult,
    updateEmbedding,
    fixEmbedding
  };
};
