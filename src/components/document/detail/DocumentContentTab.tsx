
import React from "react";

interface DocumentContentTabProps {
  document: any;
}

const DocumentContentTab = ({ document }: DocumentContentTabProps) => {
  // Extraire le contenu du document
  const content = document?.content || null;
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        Contenu ({content?.length || 0} caractères)
      </h3>
      <div className="p-3 bg-muted rounded-md text-sm max-h-96 overflow-y-auto whitespace-pre-wrap">
        {content || "Pas de contenu disponible"}
      </div>
    </div>
  );
};

export default DocumentContentTab;
