
import React, { useEffect } from "react";
import { useIndexationReport } from "../hooks/useIndexationReport";
import EmptyReportState from "./EmptyReportState";
import DocumentReportActions from "./DocumentReportActions";
import DocumentReportContent from "./DocumentReportContent";
import DebugTools from "./DebugTools";
import { exportReportToCSV } from "./utils/exportUtils";

const DocumentReport: React.FC = () => {
  const { report, isLoading, error, generateReport } = useIndexationReport();

  // Générer le rapport une fois au chargement
  useEffect(() => {
    generateReport();
  }, []);

  const handleExportCSV = () => {
    if (report) {
      exportReportToCSV(report.recentDocuments);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">État de l'indexation des documents</h2>
        <DocumentReportActions 
          onRefresh={generateReport} 
          isLoading={isLoading} 
        />
      </div>

      {report ? (
        <DocumentReportContent 
          report={report} 
          onExportCSV={handleExportCSV} 
        />
      ) : (
        <EmptyReportState 
          onGenerateReport={generateReport}
          isLoading={isLoading}
          error={error}
        />
      )}
      
      <DebugTools report={report} />
    </div>
  );
};

export default DocumentReport;
