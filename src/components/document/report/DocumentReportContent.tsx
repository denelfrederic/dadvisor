
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DownloadCloud } from "lucide-react";
import { IndexationReport } from "../hooks/useIndexationReport";
import DocumentTypeDistribution from "./DocumentTypeDistribution";
import IndexationProgressBar from "./IndexationProgressBar";
import ReportStatsCards from "./ReportStatsCards";
import DocumentTable from "./DocumentTable";
import { formatFileSize } from "../utils";

interface DocumentReportContentProps {
  report: IndexationReport;
  onExportCSV: () => void;
}

const DocumentReportContent: React.FC<DocumentReportContentProps> = ({ 
  report, 
  onExportCSV
}) => {
  return (
    <div className="space-y-6">
      <ReportStatsCards report={report} />
      <IndexationProgressBar percentage={report.embeddingsPercentage} />
      <DocumentTypeDistribution documentsByType={report.documentsByType} />

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-medium">Documents récents</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onExportCSV}
              disabled={report.recentDocuments.length === 0}
            >
              <DownloadCloud className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
          
          <DocumentTable documents={report.recentDocuments} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentReportContent;
