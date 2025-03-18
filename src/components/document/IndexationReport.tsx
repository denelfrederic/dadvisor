
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIndexationReport } from "./hooks/useIndexationReport";
import { useEmbeddingsUpdate } from "../knowledge-base/search/hooks/useEmbeddingsUpdate";
import ReportHeader from "./report/ReportHeader";
import ReportStatsCards from "./report/ReportStatsCards";
import IndexationProgressBar from "./report/IndexationProgressBar";
import DocumentTypeDistribution from "./report/DocumentTypeDistribution";
import RecentDocumentsList from "./report/RecentDocumentsList";
import EmptyReportState from "./report/EmptyReportState";
import SystemLogs from "./report/SystemLogs";

const IndexationReport = () => {
  const [activeTab, setActiveTab] = useState<string>("report");
  const { 
    report, 
    isLoading, 
    error, 
    logs, 
    generateReport, 
    clearLogs 
  } = useIndexationReport();
  
  const { 
    isUpdating: isUpdatingEmbeddings,
    updateDocumentEmbeddings
  } = useEmbeddingsUpdate();

  const exportReportToCSV = () => {
    if (!report) return;
    
    const headers = "Titre,Type,Statut Embedding,Date,Taille\n";
    const csvContent = report.recentDocuments.map(doc => {
      return `"${doc.title.replace(/"/g, '""')}","${doc.type}","${doc.hasEmbedding ? 'Oui' : 'Non'}","${new Date(doc.created_at).toLocaleString()}","${formatFileSize(doc.size)}"`;
    }).join("\n");
    
    const csv = headers + csvContent;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rapport-indexation-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportLogsToFile = () => {
    if (logs.length === 0) return;
    
    const content = logs.join("\n");
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `logs-indexation-${new Date().toISOString().slice(0,10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <ReportHeader 
        onGenerateReport={generateReport}
        onUpdateEmbeddings={updateDocumentEmbeddings}
        isLoading={isLoading}
        isUpdatingEmbeddings={isUpdatingEmbeddings}
        reportExists={!!report}
      />

      <Tabs defaultValue="report" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="report">Rapport d'indexation</TabsTrigger>
          <TabsTrigger value="logs">Logs système</TabsTrigger>
        </TabsList>
        
        <TabsContent value="report">
          {report ? (
            <div className="space-y-4">
              <ReportStatsCards report={report} />
              <IndexationProgressBar percentage={report.embeddingsPercentage} />
              <DocumentTypeDistribution documentsByType={report.documentsByType} />
              <RecentDocumentsList 
                documents={report.recentDocuments} 
                onExport={exportReportToCSV} 
              />
            </div>
          ) : (
            <EmptyReportState 
              onGenerateReport={generateReport}
              isLoading={isLoading}
              error={error}
            />
          )}
        </TabsContent>
        
        <TabsContent value="logs">
          <SystemLogs 
            logs={logs}
            onExport={exportLogsToFile}
            onClear={clearLogs}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Import missing function from utils since we're not importing the entire module anymore
import { formatFileSize } from "./utils";

export default IndexationReport;
