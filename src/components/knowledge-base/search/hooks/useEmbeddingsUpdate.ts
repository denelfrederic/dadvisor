import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  updateDocuments, 
  updateKnowledgeEntries, 
  updateAllEmbeddings 
} from "../../services/embedding/update";

export const useEmbeddingsUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = useCallback((message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  }, []);

  const updateDocumentEmbeddingsWithProgress = useCallback(async () => {
    setIsUpdating(true);
    setProgress(0);
    addLog("Début de la mise à jour des embeddings des documents...");
    
    try {
      const result = await updateDocuments();
      
      if (result.success) {
        addLog(`${result.count} documents mis à jour avec succès.`);
        setProgress(100);
        toast({
          title: "Mise à jour terminée",
          description: `${result.count} documents ont été enrichis avec des embeddings.`
        });
      } else {
        addLog("Échec de la mise à jour des embeddings des documents.");
        if (result.error) addLog(`Erreur: ${result.error}`);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour des embeddings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      addLog(`Erreur: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour des embeddings.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  }, [addLog, toast]);

  const updateKnowledgeEntryEmbeddings = useCallback(async () => {
    setIsUpdating(true);
    setProgress(0);
    addLog("Début de la mise à jour des embeddings des entrées de connaissances...");
    
    try {
      const result = await updateKnowledgeEntries(
        (progressValue) => setProgress(progressValue),
        addLog
      );
      
      setProgress(100);
      
      if (result.success) {
        toast({
          title: "Mise à jour terminée",
          description: `${result.succeeded}/${result.processed} entrées de connaissances ont été enrichies avec des embeddings.`
        });
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour des embeddings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      addLog(`Erreur globale: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour des embeddings.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  }, [addLog, toast]);

  const updateAllEmbeddingsWithProgress = useCallback(async () => {
    setIsUpdating(true);
    setProgress(0);
    addLog("Début de la mise à jour de tous les embeddings (documents et base de connaissances)...");
    
    try {
      const result = await updateAllEmbeddings(
        (progressValue) => setProgress(progressValue),
        addLog
      );
      
      setProgress(100);
      
      toast({
        title: "Mise à jour terminée",
        description: `Mise à jour des embeddings terminée pour documents et entrées de connaissances.`
      });
    } catch (error) {
      addLog(`Erreur globale: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour des embeddings.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  }, [addLog, toast]);

  return {
    isUpdating,
    progress,
    logs,
    updateDocumentEmbeddings: updateDocumentEmbeddingsWithProgress,
    updateKnowledgeEntryEmbeddings,
    updateAllEmbeddings: updateAllEmbeddingsWithProgress
  };
};
