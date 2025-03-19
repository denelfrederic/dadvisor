
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndexationReport } from "../hooks/useIndexationReport";
import ReportStatsCards from "./ReportStatsCards";
import IndexationProgressBar from "./IndexationProgressBar";
import DocumentTypeDistribution from "./DocumentTypeDistribution";
import RecentDocumentsList from "./RecentDocumentsList";
import EmptyReportState from "./EmptyReportState";
import SystemLogs from "./SystemLogs";
import { exportReportToCSV } from "./utils/exportUtils";

interface IndexationReportTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  report: IndexationReport | null;
  logs: string[];
  generateReport: () => void;
  isLoading: boolean;
  error: string | null;
  clearLogs: () => void;
  exportLogsToFile: () => void;
}

const IndexationReportTabs: React.FC<IndexationReportTabsProps> = ({
  activeTab,
  setActiveTab,
  report,
  logs,
  generateReport,
  isLoading,
  error,
  clearLogs,
  exportLogsToFile
}) => {
  return (
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
              onExport={() => exportReportToCSV(report.recentDocuments)} 
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
  );
};

export default IndexationReportTabs;
