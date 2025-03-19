
import { supabase } from "@/integrations/supabase/client";
import { IndexationReport } from "../../hooks/useIndexationReport";

/**
 * Debug utilities for document reporting
 */
export const setupDocumentReportingDebug = (report: IndexationReport | null) => {
  // Expose the report in the window object for debugging
  if (typeof window !== 'undefined') {
    (window as any).__documentReport = report;
  }

  // Return object with debug test functions
  return {
    testReportGeneration: async () => {
      console.log("Génération d'un rapport de test...");
      const { data: documents } = await supabase
        .from('documents')
        .select('id, title, type, embedding')
        .order('created_at', { ascending: false });
        
      if (!documents) {
        console.log("Aucun document trouvé");
        return null;
      }
      
      let withEmbedding = 0;
      documents.forEach(doc => {
        if (doc.embedding) withEmbedding++;
      });
      
      const stats = {
        total: documents.length,
        withEmbedding,
        withoutEmbedding: documents.length - withEmbedding,
        percentage: Math.round((withEmbedding / documents.length) * 100)
      };
      
      console.log("===== TEST RAPPORT =====");
      console.log(`Total documents: ${stats.total}`);
      console.log(`Avec embedding: ${stats.withEmbedding} (${stats.percentage}%)`);
      console.log(`Sans embedding: ${stats.withoutEmbedding}`);
      return stats;
    },
    verifyReportAccuracy: async () => {
      const dbStats = await (window as any).testDocumentReporting.testReportGeneration();
      const uiReport = (window as any).__documentReport;
      
      console.log("Rapport UI:", uiReport);
      console.log("Données DB:", dbStats);
      
      if (!uiReport || !dbStats) {
        console.log("Impossible de comparer: données manquantes");
        return;
      }
      
      const isAccurate = 
        dbStats.total === uiReport.totalDocuments &&
        dbStats.withEmbedding === uiReport.documentsWithEmbeddings &&
        dbStats.withoutEmbedding === uiReport.documentsWithoutEmbeddings &&
        dbStats.percentage === uiReport.embeddingsPercentage;
      
      console.log("Test de précision:", isAccurate ? "✅ RÉUSSI" : "❌ ÉCHOUÉ");
      
      if (!isAccurate) {
        console.log("Différences détectées:");
        if (dbStats.total !== uiReport.totalDocuments) {
          console.log(`- Total: DB=${dbStats.total}, UI=${uiReport.totalDocuments}`);
        }
        if (dbStats.withEmbedding !== uiReport.documentsWithEmbeddings) {
          console.log(`- Avec embedding: DB=${dbStats.withEmbedding}, UI=${uiReport.documentsWithEmbeddings}`);
        }
        if (dbStats.withoutEmbedding !== uiReport.documentsWithoutEmbeddings) {
          console.log(`- Sans embedding: DB=${dbStats.withoutEmbedding}, UI=${uiReport.documentsWithoutEmbeddings}`);
        }
      }
      
      return { isAccurate, dbStats, uiReport };
    }
  };
};
