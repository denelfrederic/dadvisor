
import React from "react";
import DocumentReport from "../report/DocumentReport";

const ReportTab = () => {
  return (
    <div className="space-y-4">
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
