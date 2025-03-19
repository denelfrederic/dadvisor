
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateDocuments } from "../../services/embedding/update";
import { exportLogsToFile } from "@/components/document/report/utils/logUtils";

export const useEmbeddingsUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);
  const { toast } = useToast();

  // Réinitialiser les erreurs lorsqu'on quitte la page
  useEffect(() => {
    return () => {
      setErrorSummary(null);
      setProgress(0);
    };
  }, []);

  const addLog = useCallback((message: string) => {
    console.log(message);
    const timestamp = new Date().toISOString().slice(11, 19);
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setErrorSummary(null);
  }, []);

  const exportLogs = useCallback(() => {
    exportLogsToFile(logs);
  }, [logs]);

  const updateDocumentEmbeddings = useCallback(async (forceReindex = false) => {
    setIsUpdating(true);
    setProgress(0);
    setErrorSummary(null);
    
    const actionType = forceReindex ? "réindexation forcée" : "indexation";
    addLog(`Début de ${actionType} Pinecone des documents...`);
    
    try {
      // Vérification que les API keys sont configurées
      addLog("Vérification de la configuration...");
      
      // Call the updateDocuments function with the addLog callback and forceReindex parameter
      const result = await updateDocuments(addLog, forceReindex);
      
      if (result.success) {
        addLog(`${result.count} documents indexés avec succès.`);
        setProgress(100);
        toast({
          title: "Indexation terminée",
          description: `${result.count} documents ont été indexés dans Pinecone.`
        });
      } else {
        addLog(`Échec de ${actionType} Pinecone des documents.`);
        if (result.error) {
          addLog(`Erreur: ${result.error}`);
          setErrorSummary(result.error);
        }
        toast({
          title: "Erreur",
          description: result.error || `Une erreur est survenue lors de ${actionType} Pinecone.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`Erreur: ${errorMsg}`);
      setErrorSummary(errorMsg);
      toast({
        title: "Erreur",
        description: `Une erreur est survenue lors de ${actionType} Pinecone.`,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  }, [addLog, toast]);

  const retryLastOperation = useCallback(async () => {
    addLog("Nouvelle tentative d'indexation avec configuration alternative...");
    setErrorSummary(null);
    await updateDocumentEmbeddings(false);
  }, [updateDocumentEmbeddings, addLog]);

  return {
    isUpdating,
    progress,
    logs,
    errorSummary,
    updateDocumentEmbeddings,
    clearLogs,
    exportLogs,
    addLog,
    retryLastOperation
  };
};
