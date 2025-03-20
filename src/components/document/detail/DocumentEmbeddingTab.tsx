
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { usePineconeSynchronizer } from "./hooks/usePineconeSynchronizer";
import DocumentEmbeddingStatus from "./embedding/DocumentEmbeddingStatus";
import DocumentAnalysisDisplay from "./embedding/DocumentAnalysisDisplay";
import UpdateResultMessage from "./embedding/UpdateResultMessage";
import SyncButton from "./embedding/SyncButton";
import IndexingButton from "./embedding/IndexingButton";
import AltActionButtons from "./embedding/AltActionButtons";
import RefreshButton from "./embedding/RefreshButton";

interface DocumentEmbeddingTabProps {
  document: any;
  analysis: any;
  updateResult: { success: boolean; message: string } | null;
  updatingEmbedding: boolean;
  onUpdateEmbedding: () => void;
  onFixEmbedding?: () => void;
  onReloadDocument: () => void;
  onSyncStatus?: () => void;
}

const DocumentEmbeddingTab = ({
  document,
  analysis,
  updateResult,
  updatingEmbedding,
  onUpdateEmbedding,
  onFixEmbedding,
  onReloadDocument,
  onSyncStatus,
}: DocumentEmbeddingTabProps) => {
  const { toast } = useToast();
  const [localUpdating, setLocalUpdating] = useState(false);
  const { isSynchronizing, synchronizePineconeStatus } = usePineconeSynchronizer();
  
  // Utiliser un état local pour contrôler l'affichage durant les opérations asynchrones
  useEffect(() => {
    if (updatingEmbedding !== localUpdating) {
      setLocalUpdating(updatingEmbedding);
    }
  }, [updatingEmbedding]);
  
  useEffect(() => {
    if (updateResult?.success) {
      toast({
        title: "Succès",
        description: updateResult.message,
      });
      
      // Recharger automatiquement le document après un succès
      onReloadDocument();
    } else if (updateResult && !updateResult.success) {
      toast({
        title: "Erreur",
        description: updateResult.message,
        variant: "destructive"
      });
    }
  }, [updateResult, toast, onReloadDocument]);

  if (!document) return null;

  const isPineconeIndexed = document.pinecone_indexed === true;
  const hasEmbedding = !!document.embedding;
  const needsSync = hasEmbedding && !isPineconeIndexed;

  // Gérer l'indexation avec une fonction locale pour éviter le scintillement
  const handleUpdateEmbedding = async () => {
    setLocalUpdating(true);
    try {
      await onUpdateEmbedding();
    } finally {
      // Ne pas désactiver immédiatement l'état de chargement pour permettre au composant de rester stable
      setTimeout(() => {
        setLocalUpdating(false);
      }, 500);
    }
  };

  // Gérer la synchronisation avec le hook personnalisé
  const handleSyncStatus = async () => {
    if (onSyncStatus) {
      onSyncStatus();
    } else if (document && document.id) {
      await synchronizePineconeStatus(document.id);
      onReloadDocument();
    }
  };

  if (isPineconeIndexed) {
    return (
      <div className="space-y-4">
        <DocumentEmbeddingStatus isPineconeIndexed={isPineconeIndexed} />
        <RefreshButton onReloadDocument={onReloadDocument} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DocumentEmbeddingStatus isPineconeIndexed={isPineconeIndexed} />
      
      <DocumentAnalysisDisplay analysis={analysis} />
      
      <UpdateResultMessage 
        updateResult={updateResult} 
        onReloadDocument={onReloadDocument} 
      />
      
      <SyncButton 
        needsSync={needsSync} 
        isLoading={localUpdating || isSynchronizing} 
        onSync={handleSyncStatus} 
      />
      
      <IndexingButton 
        isLoading={localUpdating || isSynchronizing} 
        isDisabled={!document.content} 
        needsSync={needsSync} 
        onUpdate={handleUpdateEmbedding} 
      />

      <AltActionButtons 
        updateResult={updateResult} 
        isLoading={localUpdating || isSynchronizing} 
        onFixEmbedding={onFixEmbedding} 
        onReloadDocument={onReloadDocument} 
      />
    </div>
  );
}

export default DocumentEmbeddingTab;
