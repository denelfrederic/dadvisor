
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
  const [errorSummary, setErrorSummary] = useState<string | null>(null);
  const { toast } = useToast();

  const addLog = useCallback((message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  }, []);

  const updateDocumentEmbeddingsWithProgress = useCallback(async () => {
    setIsUpdating(true);
    setProgress(0);
    setErrorSummary(null);
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
        if (result.error) {
          addLog(`Erreur: ${result.error}`);
          setErrorSummary(result.error);
        }
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour des embeddings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`Erreur: ${errorMsg}`);
      setErrorSummary(errorMsg);
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
    setErrorSummary(null);
    addLog("Début de la mise à jour des embeddings des entrées de connaissances...");
    
    try {
      const result = await updateKnowledgeEntries(
        // Convert progress to integer
        (progressValue) => {
          const intProgress = Math.round(progressValue);
          setProgress(intProgress);
          console.log(`Progression mise à jour: ${intProgress}%`);
        },
        addLog
      );
      
      setProgress(100);
      
      if (result.success) {
        if (result.failures && result.failures.length > 0) {
          // Group failures by reason
          const reasonCounts: Record<string, number> = {};
          result.failures.forEach(f => {
            reasonCounts[f.reason] = (reasonCounts[f.reason] || 0) + 1;
          });
          
          // Find the most common error
          const mostCommonError = Object.entries(reasonCounts)
            .sort((a, b) => b[1] - a[1])[0];
            
          if (mostCommonError) {
            const [reason, count] = mostCommonError;
            setErrorSummary(`Principale erreur (${count}/${result.failures.length}): ${reason}`);
          }
          
          toast({
            title: "Mise à jour terminée avec des avertissements",
            description: `${result.succeeded}/${result.processed} entrées ont pu être mises à jour.`,
            variant: "warning"
          });
        } else {
          toast({
            title: "Mise à jour terminée",
            description: `${result.succeeded}/${result.processed} entrées de connaissances ont été enrichies avec des embeddings.`
          });
        }
      } else {
        if (result.error) {
          addLog(`Erreur globale: ${result.error}`);
          setErrorSummary(result.error);
        }
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour des embeddings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`Erreur globale: ${errorMsg}`);
      setErrorSummary(errorMsg);
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
    setErrorSummary(null);
    addLog("Début de la mise à jour de tous les embeddings (documents et base de connaissances)...");
    
    try {
      const result = await updateAllEmbeddings(
        // Convert progress to integer
        (progressValue) => {
          const intProgress = Math.round(progressValue);
          setProgress(intProgress);
          console.log(`Progression mise à jour: ${intProgress}%`);
        },
        addLog
      );
      
      setProgress(100);
      
      if (result.success) {
        toast({
          title: "Mise à jour terminée",
          description: `Mise à jour des embeddings terminée pour documents et entrées de connaissances.`
        });
      } else if (result.error) {
        addLog(`Erreur globale: ${result.error}`);
        setErrorSummary(result.error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour des embeddings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`Erreur globale: ${errorMsg}`);
      setErrorSummary(errorMsg);
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
    errorSummary,
    updateDocumentEmbeddings: updateDocumentEmbeddingsWithProgress,
    updateKnowledgeEntryEmbeddings,
    updateAllEmbeddings: updateAllEmbeddingsWithProgress
  };
};
