
import React from "react";

interface DocumentTypesListProps {
  types: Record<string, number>;
}

const DocumentTypesList = ({ types }: DocumentTypesListProps) => {
  if (Object.keys(types).length === 0) return null;
  
  return (
    <div className="border rounded-lg p-3">
      <p className="font-medium mb-2">Types de documents:</p>
      <div className="space-y-1">
        {Object.entries(types).map(([type, count]) => (
          <div key={type} className="flex justify-between items-center text-sm">
            <span>{type || "Inconnu"}</span>
            <span className="text-muted-foreground">{count as number} fichier(s)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentTypesList;
