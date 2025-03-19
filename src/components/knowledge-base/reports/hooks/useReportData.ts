
import { useState, useEffect } from "react";
import { CombinedReport } from "../../types";
import { getKnowledgeBaseStats } from "../../services/statsService";
import { supabase } from "@/integrations/supabase/client";
import { isValidEmbedding } from "../../services/embedding/embeddingUtils";

export const useReportData = () => {
  const [report, setReport] = useState<CombinedReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get knowledge base stats
      const kbStats = await getKnowledgeBaseStats();
      
      // Get document stats
      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select('id, embedding');
      
      if (docsError) throw docsError;
      
      const docCount = docs?.length || 0;
      let docsWithEmbeddings = 0;
      
      if (docs && docs.length > 0) {
        // Count documents with valid embeddings
        for (const doc of docs) {
          if (doc.embedding && isValidEmbedding(doc.embedding)) {
            docsWithEmbeddings++;
          }
        }
      }
      
      // Build combined report
      const combinedReport: CombinedReport = {
        knowledgeBase: kbStats,
        documents: {
          total: docCount,
          withEmbeddings: docsWithEmbeddings,
          withoutEmbeddings: docCount - docsWithEmbeddings,
          percentage: docCount > 0 ? Math.round((docsWithEmbeddings / docCount) * 100) : 0
        }
      };
      
      setReport(combinedReport);
    } catch (err) {
      console.error("Error generating report:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate report on component mount
  useEffect(() => {
    generateReport();
  }, []);

  return {
    report,
    isLoading,
    error,
    refreshReport: generateReport
  };
};
