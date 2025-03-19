
import React from "react";
import { Check, AlertTriangle } from "lucide-react";
import { formatFileSize } from "../utils";

interface DocumentInfoTabProps {
  document: any;
}

const DocumentInfoTab = ({ document }: DocumentInfoTabProps) => {
  if (!document) return null;
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Titre</h3>
        <p>{document.title}</p>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
        <p>{document.type}</p>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Taille</h3>
        <p>{formatFileSize(document.size)}</p>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Date d'ajout</h3>
        <p>{new Date(document.created_at).toLocaleString()}</p>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Source</h3>
        <p>{document.source || "Non spécifiée"}</p>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Embedding</h3>
        <p className="flex items-center">
          {document.embedding ? (
            <><Check className="h-4 w-4 text-green-500 mr-2" /> Disponible</>
          ) : (
            <><AlertTriangle className="h-4 w-4 text-amber-500 mr-2" /> Non disponible</>
          )}
        </p>
      </div>
    </div>
  );
};

export default DocumentInfoTab;
