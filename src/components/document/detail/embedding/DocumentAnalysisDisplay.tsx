
import React from "react";

interface DocumentAnalysisDisplayProps {
  analysis: any;
}

/**
 * Affiche l'analyse d'un document pour le statut d'embedding
 */
const DocumentAnalysisDisplay: React.FC<DocumentAnalysisDisplayProps> = ({ analysis }) => {
  if (!analysis) return null;
  
  // Vérifier si l'analyse contient des informations sur une erreur
  const hasError = analysis.error || analysis.errorDetails;
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Analyse</h3>
      <div className={`p-3 rounded-md whitespace-pre-line ${hasError ? 'bg-red-50 border border-red-200' : 'bg-muted'}`}>
        <p>{analysis.analysis}</p>
        
        {/* Afficher les détails d'erreur si présents */}
        {analysis.errorDetails && (
          <div className="mt-2 pt-2 border-t border-red-200">
            <p className="text-xs font-medium text-red-700">Détails de l'erreur:</p>
            <p className="text-xs font-mono">{analysis.errorDetails}</p>
          </div>
        )}
        
        {/* Afficher les informations de configuration si présentes */}
        {analysis.config && (
          <div className="mt-2 pt-2 border-t border-muted-foreground/20">
            <p className="text-xs font-medium">Configuration utilisée:</p>
            <div className="text-xs font-mono">
              {Object.entries(analysis.config).map(([key, value]) => (
                <div key={key}>{key}: {String(value)}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentAnalysisDisplay;
