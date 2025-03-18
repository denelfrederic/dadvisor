
import React from "react";
import { CombinedReport } from "../../types";
import KnowledgeBaseCard from "./KnowledgeBaseCard";
import DocumentsCard from "./DocumentsCard";
import GlobalSummaryCard from "./GlobalSummaryCard";
import EmptyReportState from "./EmptyReportState";

interface CurrentReportProps {
  report: CombinedReport | null;
  isLoading: boolean;
  onGenerateReport: () => void;
}

const CurrentReport = ({ report, isLoading, onGenerateReport }: CurrentReportProps) => {
  if (!report) {
    return <EmptyReportState isLoading={isLoading} onGenerateReport={onGenerateReport} />;
  }

  return (
    <div className="space-y-6">
      {/* Base de Connaissances */}
      <KnowledgeBaseCard knowledgeBaseStats={report.knowledgeBase} />

      {/* Documents */}
      <DocumentsCard documentsStats={report.documents} />

      {/* Résumé global */}
      <GlobalSummaryCard report={report} />
    </div>
  );
};

export default CurrentReport;
