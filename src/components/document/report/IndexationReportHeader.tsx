
import React from "react";
import DocumentReportActions from "./DocumentReportActions";

interface IndexationReportHeaderProps {
  onGenerateReport: () => void;
  onUpdateEmbeddings: () => void;
  isLoading: boolean;
  isUpdatingEmbeddings: boolean;
  reportExists: boolean;
}

const IndexationReportHeader: React.FC<IndexationReportHeaderProps> = ({
  onGenerateReport,
  onUpdateEmbeddings,
  isLoading,
  isUpdatingEmbeddings,
  reportExists
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-medium">État de l'indexation des documents</h2>
      <DocumentReportActions 
        onRefresh={onGenerateReport}
        onUpdateEmbeddings={onUpdateEmbeddings}
        isLoading={isLoading}
        isUpdatingEmbeddings={isUpdatingEmbeddings}
        showUpdateEmbeddings={reportExists}
      />
    </div>
  );
};

export default IndexationReportHeader;
