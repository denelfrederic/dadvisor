
import React from "react";

interface DocumentAnalysisDisplayProps {
  analysis: any;
}

/**
 * Affiche l'analyse d'un document pour le statut d'embedding
 */
const DocumentAnalysisDisplay: React.FC<DocumentAnalysisDisplayProps> = ({ analysis }) => {
  if (!analysis) return null;
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Analyse</h3>
      <div className="p-3 bg-muted rounded-md whitespace-pre-line">
        <p>{analysis.analysis}</p>
      </div>
    </div>
  );
};

export default DocumentAnalysisDisplay;
