
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateDocuments } from "../../services/embedding/update";
import { exportLogsToFile } from "@/components/document/report/utils/logUtils";

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

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const exportLogs = useCallback(() => {
    exportLogsToFile(logs);
  }, [logs]);

  const updateDocumentEmbeddings = useCallback(async () => {
    setIsUpdating(true);
    setProgress(0);
    setErrorSummary(null);
    addLog("Début de l'indexation Pinecone des documents...");
    
    try {
      // Call the updateDocuments function with the addLog callback
      const result = await updateDocuments(addLog);
      
      if (result.success) {
        addLog(`${result.count} documents indexés avec succès.`);
        setProgress(100);
        toast({
          title: "Indexation terminée",
          description: `${result.count} documents ont été indexés dans Pinecone.`
        });
      } else {
        addLog("Échec de l'indexation Pinecone des documents.");
        if (result.error) {
          addLog(`Erreur: ${result.error}`);
          setErrorSummary(result.error);
        }
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue lors de l'indexation Pinecone.",
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`Erreur: ${errorMsg}`);
      setErrorSummary(errorMsg);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'indexation Pinecone.",
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
    updateDocumentEmbeddings,
    clearLogs,
    exportLogs,
    addLog
  };
};
