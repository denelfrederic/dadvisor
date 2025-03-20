
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  onReloadDocument: () => void;
}

/**
 * Bouton de rafraîchissement des informations du document
 */
const RefreshButton: React.FC<RefreshButtonProps> = ({ onReloadDocument }) => {
  return (
    <Button
      onClick={onReloadDocument}
      variant="outline"
      size="sm"
      className="mt-2"
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      Rafraîchir les informations
    </Button>
  );
};

export default RefreshButton;
