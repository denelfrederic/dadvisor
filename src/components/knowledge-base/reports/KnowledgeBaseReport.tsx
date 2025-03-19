
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import KnowledgeBaseCard from "./components/KnowledgeBaseCard";
import EmptyReportState from "./components/EmptyReportState";
import DebugButtons from "./components/DebugButtons";
import { useKnowledgeBaseReport } from "./hooks/useKnowledgeBaseReport";

const KnowledgeBaseReport = () => {
  const { report, isLoading, generateReport, checkRawEmbeddings } = useKnowledgeBaseReport();

  // Exposer le rapport globalement pour le débogage
  useEffect(() => {
    if (typeof window !== 'undefined' && report) {
      (window as any).__knowledgeBaseReport = report;
    }
  }, [report]);

  const handleShowReport = () => {
    console.log("Rapport actuel de la base de connaissances:", report);
    if (!report) {
      console.log("Aucun rapport disponible. Veuillez d'abord générer un rapport.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">État de la base de connaissances</h2>
        <Button 
          onClick={generateReport} 
          disabled={isLoading}
          variant="outline" 
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Analyse...' : 'Actualiser le rapport'}
        </Button>
      </div>

      {report ? (
        <KnowledgeBaseCard knowledgeBaseStats={report} />
      ) : (
        <EmptyReportState 
          isLoading={isLoading} 
          onGenerateReport={generateReport} 
        />
      )}
      
      {/* Debug buttons component avec handlers explicites */}
      <DebugButtons 
        onShowReport={handleShowReport}
        onCheckEmbeddings={checkRawEmbeddings}
      />
    </div>
  );
};

export default KnowledgeBaseReport;
