
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Database, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface IndexingButtonProps {
  isLoading: boolean;
  isDisabled: boolean;
  needsSync: boolean;
  onUpdate: () => void;
  documentSize?: number; // Taille du document en caractères
}

/**
 * Bouton principal d'indexation d'un document dans Pinecone
 * Avec gestion améliorée pour les documents volumineux
 */
const IndexingButton: React.FC<IndexingButtonProps> = ({
  isLoading,
  isDisabled,
  needsSync,
  onUpdate,
  documentSize = 0
}) => {
  // Déterminer si le document est volumineux (plus de 10000 caractères)
  const isLargeDocument = documentSize > 10000;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={onUpdate} 
            disabled={isLoading || isDisabled}
            className={`w-full ${isLargeDocument ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {needsSync ? "Synchronisation en cours..." : "Indexation en cours..."}
              </>
            ) : (
              <>
                {isLargeDocument ? (
                  <AlertTriangle className="h-4 w-4 mr-2" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                {isLargeDocument ? "Indexer (document volumineux)" : "Indexer dans Pinecone"}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isLargeDocument 
            ? "Ce document est volumineux. Seule une partie sera vectorisée pour l'indexation dans Pinecone." 
            : "Indexer ce document dans Pinecone pour la recherche sémantique"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default IndexingButton;
