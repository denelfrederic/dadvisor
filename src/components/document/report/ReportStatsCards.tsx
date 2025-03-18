
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndexationReport } from "../hooks/useIndexationReport";

interface ReportStatsCardsProps {
  report: IndexationReport;
}

const ReportStatsCards = ({ report }: ReportStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Documents totaux</span>
          <span className="text-2xl font-bold">{report.totalDocuments}</span>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Avec embeddings</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{report.documentsWithEmbeddings}</span>
            <Badge variant={report.embeddingsPercentage > 80 ? "default" : "destructive"}>
              {report.embeddingsPercentage}%
            </Badge>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Sans embeddings</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{report.documentsWithoutEmbeddings}</span>
            {report.documentsWithoutEmbeddings > 0 && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
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
