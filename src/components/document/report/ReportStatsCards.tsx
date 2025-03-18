
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndexationReport } from "../hooks/useIndexationReport";

interface ReportStatsCardsProps {
  report: IndexationReport;
}

const ReportStatsCards = ({ report }: ReportStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6">
        <div className="flex flex-col">
          <span className="text-muted-foreground mb-2">Documents totaux</span>
          <span className="text-4xl font-bold">{report.totalDocuments}</span>
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="flex flex-col">
          <span className="text-muted-foreground mb-2">Avec embeddings</span>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold">{report.documentsWithEmbeddings}</span>
            <Badge 
              variant={report.embeddingsPercentage > 50 ? "default" : "destructive"}
              className="text-sm"
            >
              {report.embeddingsPercentage}%
            </Badge>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="flex flex-col">
          <span className="text-muted-foreground mb-2">Sans embeddings</span>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold">{report.documentsWithoutEmbeddings}</span>
            {report.documentsWithoutEmbeddings > 0 && (
              <Badge 
                variant="outline" 
                className="bg-amber-100 text-amber-800 hover:bg-amber-100"
              >
                Attention
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReportStatsCards;
