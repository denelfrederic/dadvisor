
import React from "react";
import { useEmbeddingsUpdate } from "../../knowledge-base/search/hooks/useEmbeddingsUpdate";
import SystemLogs from "./SystemLogs";
import DebugInfo from "./DebugInfo";
import ErrorAlert from "./components/ErrorAlert";
import ProgressSection from "./components/ProgressSection";
import HeaderSection from "./components/HeaderSection";

/**
 * Composant principal pour le rapport d'indexation de documents
 * Affiche l'état de l'indexation Pinecone et les outils de diagnostic
 */
const DocumentReport: React.FC = () => {
  const { 
    updateDocumentEmbeddings, 
    isUpdating, 
    logs, 
    clearLogs, 
    exportLogs,
    errorSummary,
    progress,
    retryLastOperation,
    addLog
  } = useEmbeddingsUpdate();
  
  const handleGetDebugInfo = () => {
    addLog("Récupération des informations de diagnostic Pinecone...");
  };
  
  return (
    <div className="space-y-6">
      {/* Section d'en-tête avec les actions principales */}
      <HeaderSection 
        onUpdateDocuments={updateDocumentEmbeddings}
        onClearLogs={clearLogs}
        onExportLogs={exportLogs}
        isUpdating={isUpdating}
        hasLogs={logs.length > 0}
      />
      
      {/* Affichage des erreurs avec solutions suggérées */}
      <ErrorAlert 
        errorSummary={errorSummary} 
        onRetry={retryLastOperation} 
      />

      {/* Barre de progression pour l'indexation */}
      <ProgressSection progress={progress} />

      {/* Outil de diagnostic Pinecone */}
      <DebugInfo onGetInfo={handleGetDebugInfo} />

      {/* Affichage des logs système */}
      <SystemLogs 
        logs={logs}
        onExport={exportLogs}
        onClear={clearLogs}
      />
    </div>
  );
};

export default DocumentReport;
