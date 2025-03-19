
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useEmbeddingUpdater = () => {
  const [updatingEmbedding, setUpdatingEmbedding] = useState(false);
  const [updateResult, setUpdateResult] = useState<{success: boolean; message: string} | null>(null);
  const [updateLogs, setUpdateLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = (message: string) => {
    console.log(message);
    setUpdateLogs(prev => [...prev, message]);
  };

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
    setUpdateLogs([]);
    
    try {
      addLog(`Début de l'indexation Pinecone pour le document ${document.id} (${document.title})`);
      
      // Pour les documents volumineux, tronquer le contenu
      const contentLength = document.content.length;
      const maxLength = contentLength > 15000 ? 6000 : 8000;
      const truncatedContent = document.content.substring(0, maxLength);
      
      addLog(`Contenu préparé: ${truncatedContent.length}/${contentLength} caractères`);
      
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
      
      // Mettre à jour le document dans Supabase pour indiquer qu'il est indexé dans Pinecone
      addLog("Mise à jour du document dans Supabase...");
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          pinecone_indexed: true,
          embedding: pineconeData.embedding // Stocker également l'embedding pour la compatibilité
        })
        .eq('id', document.id);
      
      if (updateError) {
        addLog(`Erreur lors de la mise à jour du document dans Supabase: ${updateError.message}`);
        throw new Error(`Erreur lors de la mise à jour du document: ${updateError.message}`);
      }
      
      addLog(`Document mis à jour avec succès dans Supabase (pinecone_indexed=true)`);
      
      setUpdateResult({
        success: true,
        message: "Document indexé avec succès dans Pinecone"
      });
      
      toast({
        title: "Succès",
        description: "Document indexé avec succès dans Pinecone"
      });
    } catch (error) {
      addLog(`Erreur finale: ${error instanceof Error ? error.message : String(error)}`);
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
    setUpdateLogs([]);
    
    try {
      addLog(`Tentative d'indexation alternative pour le document ${document.id}`);
      toast({
        title: "Information",
        description: "Tentative d'indexation alternative en cours..."
      });
      
      // Utiliser un contenu plus court pour l'indexation
      const shortenedContent = document.content.substring(0, 4000);
      addLog(`Utilisation d'un contenu réduit (${shortenedContent.length} caractères)`);
      
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
        const errorMsg = pineconeError?.message || pineconeData?.error || "Échec de l'indexation alternative";
        addLog(`Erreur: ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      addLog("Vectorisation alternative réussie, mise à jour Supabase...");
      
      // Mettre à jour le document dans Supabase
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          pinecone_indexed: true,
          embedding: pineconeData.embedding
        })
        .eq('id', document.id);
      
      if (updateError) {
        addLog(`Erreur de mise à jour Supabase: ${updateError.message}`);
        throw new Error(`Erreur de mise à jour Supabase: ${updateError.message}`);
      }
      
      addLog("Document mis à jour avec succès");
      
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
      addLog(`Erreur finale: ${errorMessage}`);
      
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
    updateLogs,
    setUpdateResult,
    updateEmbedding,
    fixEmbedding
  };
};
