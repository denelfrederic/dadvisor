
import React from "react";
import DocumentReport from "../report/DocumentReport";
import { FileText } from "lucide-react";

const ReportTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Rapport d'indexation des documents</h2>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Ce rapport analyse l'état d'indexation de vos documents et vous permet de générer 
        les embeddings manquants pour améliorer la recherche sémantique. Le modèle utilisé génère 
        des embeddings de 384 dimensions.
      </p>
      
      <DocumentReport />
    </div>
  );
};

export default ReportTab;
