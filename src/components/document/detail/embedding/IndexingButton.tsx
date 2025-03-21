
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Database } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface IndexingButtonProps {
  isLoading: boolean;
  isDisabled: boolean;
  needsSync: boolean;
  onUpdate: () => void;
}

/**
 * Bouton principal d'indexation d'un document
 * Version simplifiée sans Pinecone
 */
const IndexingButton: React.FC<IndexingButtonProps> = ({
  isLoading,
  isDisabled,
  needsSync,
  onUpdate
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={onUpdate} 
            disabled={isLoading || isDisabled}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {needsSync ? "Synchronisation en cours..." : "Indexation en cours..."}
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Indexer le document
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Indexer ce document pour la recherche
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default IndexingButton;
