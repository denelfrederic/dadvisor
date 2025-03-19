
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useEmbeddingUpdater = () => {
  const [updatingEmbedding, setUpdatingEmbedding] = useState(false);
  const [updateResult, setUpdateResult] = useState<{success: boolean; message: string} | null>(null);
  const { toast } = useToast();

  // Vectoriser avec Pinecone
  const updateEmbedding = async (document: any) => {
    if (!document || !document.content) {
      toast({
        title: "Erreur",
        description: "Le document est vide ou n'a pas de contenu",
        variant: "destructive"
      });
      return;
    }
    
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
        throw new Error(`Erreur lors de l'appel à l'API Pinecone: ${pineconeError.message}`);
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
        throw new Error(`Erreur lors de la mise à jour du document: ${updateError.message}`);
      }
      
      console.log(`Document ${document.id} mis à jour avec succès dans Supabase (pinecone_indexed=true)`);
      
      setUpdateResult({
        success: true,
        message: "Document indexé avec succès dans Pinecone"
      });
      
      toast({
        title: "Succès",
        description: "Document indexé avec succès dans Pinecone"
      });
    } catch (error) {
      console.error("Erreur lors de l'indexation avec Pinecone:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      setUpdateResult({
        success: false,
        message: `Erreur: ${errorMessage}`
      });
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUpdatingEmbedding(false);
    }
  };
  
  // Fonction de tentative alternative d'indexation
  const fixEmbedding = async (document: any) => {
    if (!document || !document.content) return;
    
    setUpdatingEmbedding(true);
    setUpdateResult(null);
    
    try {
      console.log(`Tentative d'indexation alternative pour le document ${document.id}`);
      toast({
        title: "Information",
        description: "Tentative d'indexation alternative en cours..."
      });
      
      // Utiliser un contenu plus court pour l'indexation
      const shortenedContent = document.content.substring(0, 4000);
      
      const { data: pineconeData, error: pineconeError } = await supabase.functions.invoke('pinecone-vectorize', {
        body: {
          action: 'vectorize',
          documentId: document.id,
          documentContent: shortenedContent,
          documentTitle: document.title,
          documentType: document.type
        }
      });
      
      if (pineconeError || !pineconeData?.success) {
        throw new Error(pineconeError?.message || pineconeData?.error || "Échec de l'indexation alternative");
      }
      
      // Mettre à jour le document dans Supabase
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          pinecone_indexed: true,
          embedding: pineconeData.embedding
        })
        .eq('id', document.id);
      
      if (updateError) {
        throw new Error(`Erreur de mise à jour Supabase: ${updateError.message}`);
      }
      
      setUpdateResult({
        success: true,
        message: "Document indexé avec succès via la méthode alternative"
      });
      
      toast({
        title: "Succès",
        description: "Document indexé avec succès via la méthode alternative"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Erreur lors de l'indexation alternative:", errorMessage);
      
      setUpdateResult({
        success: false,
        message: `Erreur alternative: ${errorMessage}`
      });
      
      toast({
        title: "Échec",
        description: `L'indexation alternative a échoué: ${errorMessage}`,
        variant: "destructive"
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
