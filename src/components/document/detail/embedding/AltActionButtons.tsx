
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface AltActionButtonsProps {
  updateResult: { success: boolean; message: string } | null;
  isLoading: boolean;
  onFixEmbedding?: () => void;
  onReloadDocument: () => void;
}

/**
 * Boutons d'actions alternatives pour la réparation ou le rechargement
 */
const AltActionButtons: React.FC<AltActionButtonsProps> = ({
  updateResult,
  isLoading,
  onFixEmbedding,
  onReloadDocument
}) => {
  if (!updateResult) return null;

  return (
    <>
      {/* Bouton de solution alternative */}
      {onFixEmbedding && !updateResult.success && (
        <Button 
          onClick={onFixEmbedding}
          variant="outline"
          size="sm"
          className="w-full mt-2"
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer l'indexation
        </Button>
      )}

      {!updateResult.success && (
        <Button 
          onClick={onReloadDocument}
          variant="outline"
          size="sm"
          className="w-full mt-2"
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Rafraîchir les données du document
        </Button>
      )}
    </>
  );
};

export default AltActionButtons;
