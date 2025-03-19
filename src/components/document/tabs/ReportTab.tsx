
import React, { useEffect } from "react";
import DocumentReport from "../report/DocumentReport";
import { FileText } from "lucide-react";
import { useIndexationReport } from "../hooks/useIndexationReport";
import * as manualTest from "../tests/manualTest";

const ReportTab = () => {
  const { report } = useIndexationReport();
  
  // For debugging purposes: make the report available in the window object
  // so our manual tests can access it
  useEffect(() => {
    if (report) {
      (window as any).__documentReport = report;
      console.log("Document report saved to window.__documentReport for testing", report);
    }
    
    // Also expose the manual test functions
    (window as any).testDocumentReporting = manualTest;
    
    return () => {
      // Clean up
      delete (window as any).__documentReport;
    };
  }, [report]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Rapport d'indexation des documents</h2>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Ce rapport analyse l'état d'indexation de vos documents et vous permet de générer 
        les embeddings manquants pour améliorer la recherche sémantique. Le modèle utilisé génère 
        des embeddings de 384 dimensions.
      </p>
      
      <div className="bg-muted/30 p-3 rounded-md text-xs mb-4">
        <p className="font-medium mb-1">📋 Tests manuels disponibles:</p>
        <code className="block text-xs my-1">window.testDocumentReporting.testReportGeneration()</code>
        <code className="block text-xs my-1">window.testDocumentReporting.testEmbeddingUpdate()</code>
        <code className="block text-xs my-1">window.testDocumentReporting.verifyReportAccuracy()</code>
      </div>
      
      <DocumentReport />
    </div>
  );
};

export default ReportTab;
