
import React from "react";
import DocumentUploader from "../DocumentUploader";

interface UploadTabProps {
  onUploadComplete: () => void;
}

const UploadTab = ({ onUploadComplete }: UploadTabProps) => {
  return (
    <div className="space-y-4">
      <DocumentUploader onUploadComplete={onUploadComplete} />
      
      <div className="bg-muted p-3 rounded text-sm">
        <p className="font-medium">Conseils pour améliorer le RAG:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1 text-muted-foreground">
          <li>Privilégiez les documents textuels au format TXT ou MD</li>
          <li>Les documents structurés (CSV, JSON) sont plus faciles à indexer</li>
          <li>Évitez les documents trop volumineux ou très formatés</li>
        </ul>
      </div>
    </div>
  );
};

export default UploadTab;
