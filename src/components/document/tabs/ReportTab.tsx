
import React from "react";
import { FileText } from "lucide-react";
import DocumentReport from "../report/DocumentReport";

const ReportTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Indexation Pinecone</h2>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Indexez vos documents dans Pinecone pour améliorer la recherche sémantique.
        L'indexation utilise le service Pinecone pour générer des embeddings vectoriels.
      </p>
      
      <DocumentReport />
    </div>
  );
};

export default ReportTab;
