
/**
 * Hook pour gérer la mise à jour des embeddings des documents
 * Ce hook orchestre l'ensemble du processus d'embedding
 */

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { EmbeddableDocument, EmbeddingUpdateResult } from "./embedding/types";
import { performStandardEmbedding, performAlternativeEmbedding } from "./embedding/embeddingOperations";

export const useEmbeddingUpdater = () => {
  const [updatingEmbedding, setUpdatingEmbedding] = useState(false);
  const [updateResult, setUpdateResult] = useState<EmbeddingUpdateResult | null>(null);
  const [updateLogs, setUpdateLogs] = useState<string[]>([]);
  const { toast } = useToast();

  // Vectoriser avec Pinecone (méthode standard)
  const updateEmbedding = async (document: EmbeddableDocument) => {
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
      // Exécuter l'opération d'embedding standard
      const result = await performStandardEmbedding(document);
      
      // Mettre à jour l'état avec les résultats
      setUpdateLogs(result.logs || []);
      setUpdateResult({
        success: result.success,
        message: result.message
      });
      
      // Afficher un toast avec le résultat
      toast({
        title: result.success ? "Succès" : "Erreur",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
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
  const fixEmbedding = async (document: EmbeddableDocument) => {
    if (!document || !document.content) return;
    
    setUpdatingEmbedding(true);
    setUpdateResult(null);
    setUpdateLogs([]);
    
    try {
      toast({
        title: "Information",
        description: "Tentative d'indexation alternative en cours..."
      });
      
      // Exécuter l'opération d'embedding alternative
      const result = await performAlternativeEmbedding(document);
      
      // Mettre à jour l'état avec les résultats
      setUpdateLogs(result.logs || []);
      setUpdateResult({
        success: result.success,
        message: result.message
      });
      
      // Afficher un toast avec le résultat
      toast({
        title: result.success ? "Succès" : "Échec",
        description: result.message,
        variant: result.success ? "default" : "destructive"
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
