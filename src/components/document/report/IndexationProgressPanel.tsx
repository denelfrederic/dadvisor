
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ReportData } from "../hooks/useIndexationReport";

interface IndexationProgressPanelProps {
  report: ReportData;
}

/**
 * Composant qui affiche la progression de l'indexation des documents
 * @param report Données du rapport d'indexation
 */
const IndexationProgressPanel: React.FC<IndexationProgressPanelProps> = ({ report }) => {
  // Calcul du pourcentage d'indexation
  const totalDocuments = report.totalDocuments || 0;
  const indexedDocuments = report.indexedDocuments || 0;
  const progressPercentage = totalDocuments > 0 
    ? Math.round((indexedDocuments / totalDocuments) * 100) 
    : 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progression de l'indexation</span>
            <span className="text-sm font-medium">{progressPercentage}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2" 
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{indexedDocuments} documents indexés</span>
            <span>Total: {totalDocuments} documents</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndexationProgressPanel;
