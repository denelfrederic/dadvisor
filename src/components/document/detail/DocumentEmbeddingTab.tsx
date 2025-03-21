
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import DocumentEmbeddingStatus from "./embedding/DocumentEmbeddingStatus";
import DocumentAnalysisDisplay from "./embedding/DocumentAnalysisDisplay";
import UpdateResultMessage from "./embedding/UpdateResultMessage";
import IndexingButton from "./embedding/IndexingButton";
import RefreshButton from "./embedding/RefreshButton";

interface DocumentEmbeddingTabProps {
  document: any;
  analysis: any;
  updateResult: { success: boolean; message: string } | null;
  updatingEmbedding: boolean;
  onUpdateEmbedding: () => void;
  onReloadDocument: () => void;
}

const DocumentEmbeddingTab = ({
  document,
  analysis,
  updateResult,
  updatingEmbedding,
  onUpdateEmbedding,
  onReloadDocument,
}: DocumentEmbeddingTabProps) => {
  const { toast } = useToast();
  const [localUpdating, setLocalUpdating] = useState(false);
  
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

  const hasEmbedding = !!document.embedding;
  const needsSync = false; // Suppression de la logique Pinecone, on simplifie

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

  return (
    <div className="space-y-4">
      <DocumentEmbeddingStatus isPineconeIndexed={hasEmbedding} />
      
      <DocumentAnalysisDisplay analysis={analysis} />
      
      <UpdateResultMessage 
        updateResult={updateResult} 
        onReloadDocument={onReloadDocument} 
      />
      
      <IndexingButton 
        isLoading={localUpdating} 
        isDisabled={!document.content} 
        needsSync={needsSync} 
        onUpdate={handleUpdateEmbedding}
      />

      <RefreshButton onReloadDocument={onReloadDocument} />
    </div>
  );
}

export default DocumentEmbeddingTab;
