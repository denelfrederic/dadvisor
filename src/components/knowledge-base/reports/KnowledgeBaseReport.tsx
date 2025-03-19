import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import KnowledgeBaseCard from "./components/KnowledgeBaseCard";
import EmptyReportState from "./components/EmptyReportState";
import DebugButtons from "./components/DebugButtons";
import { useKnowledgeBaseReport } from "./hooks/useKnowledgeBaseReport";

const KnowledgeBaseReport = () => {
  const { report, isLoading, generateReport, checkRawEmbeddings } = useKnowledgeBaseReport();

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
      
      {/* Debug buttons component */}
      <DebugButtons 
        onShowReport={() => {
          console.log("Rapport actuel de la base de connaissances:", report);
        }}
        onCheckEmbeddings={checkRawEmbeddings}
      />
    </div>
  );
};

export default KnowledgeBaseReport;
