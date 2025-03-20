
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { IndexationReport } from "../hooks/useIndexationReport";

interface IndexationProgressPanelProps {
  report: IndexationReport;
}

/**
 * Composant qui affiche la progression de l'indexation des documents
 * @param report Données du rapport d'indexation
 */
const IndexationProgressPanel: React.FC<IndexationProgressPanelProps> = ({ report }) => {
  // Calcul du pourcentage d'indexation
  const totalDocuments = report.totalDocuments || 0;
  const documentsWithEmbeddings = report.documentsWithEmbeddings || 0;
  const pineconeIndexedCount = report.pineconeIndexedCount || 0;
  
  // On utilise le nombre de documents indexés dans Pinecone pour l'affichage de la progression
  const progressPercentage = totalDocuments > 0 
    ? Math.round((pineconeIndexedCount / totalDocuments) * 100) 
    : 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center flex-wrap">
            <span className="text-sm font-medium">Progression de l'indexation</span>
            <span className="text-sm font-medium">{progressPercentage}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2" 
          />
          <div className="flex flex-col xs:flex-row justify-between text-xs text-muted-foreground mt-1 gap-1">
            <span className="truncate">{pineconeIndexedCount} documents indexés dans Pinecone</span>
            <span>Total: {totalDocuments} documents</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndexationProgressPanel;
