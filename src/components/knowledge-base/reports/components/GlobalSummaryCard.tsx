
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CombinedReport } from "../../types";

interface GlobalSummaryCardProps {
  report: CombinedReport;
}

const GlobalSummaryCard = ({ report }: GlobalSummaryCardProps) => {
  const totalSources = report.knowledgeBase.count + report.documents.total;
  const withEmbeddings = (report.knowledgeBase.withEmbeddings || 0) + report.documents.withEmbeddings;
  const globalPercentage = totalSources > 0 
    ? Math.round((withEmbeddings / totalSources) * 100)
    : 0;

  console.log("GlobalSummaryCard calculation:", {
    totalSources,
    withEmbeddings,
    globalPercentage,
    knowledgeBase: report.knowledgeBase,
    documents: report.documents
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Résumé Global</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Sources de données totales</span>
            <span className="font-medium">{totalSources}</span>
          </div>
          <div className="flex justify-between">
            <span>Sources avec embeddings</span>
            <span className="font-medium">{withEmbeddings}</span>
          </div>
          <div className="flex justify-between">
            <span>Progression globale d'indexation</span>
            <span className="font-medium">{globalPercentage}%</span>
          </div>
          <Progress 
            value={globalPercentage}
            className="h-2 mt-1" 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalSummaryCard;
