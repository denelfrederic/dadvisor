
import React from "react";
import { Check, AlertTriangle } from "lucide-react";

interface DocumentEmbeddingStatusProps {
  isPineconeIndexed: boolean;
}

/**
 * Affiche le statut d'indexation d'un document dans Pinecone
 */
const DocumentEmbeddingStatus: React.FC<DocumentEmbeddingStatusProps> = ({ 
  isPineconeIndexed 
}) => {
  if (isPineconeIndexed) {
    return (
      <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
        <Check className="h-5 w-5" />
        <span>Ce document est indexé dans Pinecone et peut être utilisé pour la recherche sémantique.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-md">
      <AlertTriangle className="h-5 w-5" />
      <span>Ce document n'est pas marqué comme indexé dans Pinecone et pourrait ne pas être utilisé pour la recherche sémantique.</span>
    </div>
  );
};

export default DocumentEmbeddingStatus;
