
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface SyncButtonProps {
  needsSync: boolean;
  isLoading: boolean;
  onSync: () => void;
}

/**
 * Bouton de synchronisation pour les documents ayant un embedding mais non indexés
 */
const SyncButton: React.FC<SyncButtonProps> = ({ needsSync, isLoading, onSync }) => {
  if (!needsSync) return null;

  return (
    <Button 
      onClick={onSync}
      variant="outline" 
      className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Synchronisation en cours...
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4 mr-2" />
          Synchroniser le statut Pinecone
        </>
      )}
    </Button>
  );
};

export default SyncButton;
