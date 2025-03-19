
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DocumentIndexationStatus {
  id: string;
  title: string;
  type: string;
  hasEmbedding: boolean;
  created_at: string;
  size: number;
}

export interface IndexationReport {
  totalDocuments: number;
  documentsWithEmbeddings: number;
  documentsWithoutEmbeddings: number;
  embeddingsPercentage: number;
  documentsByType: Record<string, number>;
  recentDocuments: DocumentIndexationStatus[];
}

/**
 * Verifies if an embedding is valid by checking if it's an array with numeric values
 */
const isValidEmbedding = (embedding: any): boolean => {
  if (!embedding) return false;
  
  try {
    // If embedding is a string, try to parse it
    const embeddingValue = typeof embedding === 'string' 
      ? JSON.parse(embedding) 
      : embedding;
      
    // Check if it's an array with at least one numeric element
    return Array.isArray(embeddingValue) && 
           embeddingValue.length > 0 && 
           embeddingValue.every(val => typeof val === 'number');
  } catch (error) {
    console.error("Error validating embedding:", error);
    return false;
  }
};

export const useIndexationReport = () => {
  const [report, setReport] = useState<IndexationReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prevLogs => [logEntry, ...prevLogs.slice(0, 49)]); // Keep last 50 logs
    console.log(logEntry); // Also log to console for debugging
  };

  const generateReport = async () => {
    setIsLoading(true);
    setError(null);
    addLog("Génération du rapport d'indexation...");
    
    try {
      // Récupérer tous les documents avec leur statut d'embedding
      const { data: documents, error: fetchError } = await supabase
        .from('documents')
        .select('id, title, type, content, embedding, created_at, size')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        throw new Error(`Erreur lors de la récupération des documents: ${fetchError.message}`);
      }
      
      addLog(`${documents?.length || 0} documents récupérés pour analyse`);
      console.log("Documents retrieved:", documents);
      
      if (!documents || documents.length === 0) {
        setReport({
          totalDocuments: 0,
          documentsWithEmbeddings: 0,
          documentsWithoutEmbeddings: 0,
          embeddingsPercentage: 0,
          documentsByType: {},
          recentDocuments: []
        });
        addLog("Aucun document trouvé dans la base de données");
        return;
      }
      
      // Analyser les documents
      const documentsByType: Record<string, number> = {};
      let documentsWithEmbeddings = 0;
      
      documents.forEach(doc => {
        // Compter par type
        const type = doc.type || "inconnu";
        documentsByType[type] = (documentsByType[type] || 0) + 1;
        
        // Vérifier si l'embedding existe et est valide
        const hasEmbedding = isValidEmbedding(doc.embedding);
        
        // Compter documents avec embedding
        if (hasEmbedding) {
          documentsWithEmbeddings++;
        }
        
        console.log(`Document ${doc.id} has embedding: ${hasEmbedding}, type: ${type}`);
      });
      
      const totalDocuments = documents.length;
      const documentsWithoutEmbeddings = totalDocuments - documentsWithEmbeddings;
      const embeddingsPercentage = totalDocuments > 0 
        ? Math.round((documentsWithEmbeddings / totalDocuments) * 100) 
        : 0;
      
      // Préparer les documents récents pour l'affichage
      const recentDocuments: DocumentIndexationStatus[] = documents.slice(0, 10).map(doc => ({
        id: doc.id,
        title: doc.title || "Sans titre",
        type: doc.type || "inconnu",
        hasEmbedding: isValidEmbedding(doc.embedding),
        created_at: doc.created_at,
        size: doc.size || 0
      }));
      
      // Créer le rapport
      const newReport = {
        totalDocuments,
        documentsWithEmbeddings,
        documentsWithoutEmbeddings,
        embeddingsPercentage,
        documentsByType,
        recentDocuments
      };
      
      console.log("Generated report:", newReport);
      setReport(newReport);
      addLog(`Rapport généré avec succès: ${documentsWithEmbeddings}/${totalDocuments} documents avec embeddings (${embeddingsPercentage}%)`);
      
      toast({
        title: "Rapport d'indexation généré",
        description: `${totalDocuments} documents analysés (${embeddingsPercentage}% avec embeddings)`
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
      console.error("Error generating report:", err);
      setError(errorMessage);
      addLog(`ERREUR: ${errorMessage}`);
      
      toast({
        title: "Erreur",
        description: `Échec de génération du rapport: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearLogs = () => {
    setLogs([]);
    addLog("Logs effacés");
  };

  return {
    report,
    isLoading,
    error,
    logs,
    generateReport,
    clearLogs,
    addLog
  };
};
