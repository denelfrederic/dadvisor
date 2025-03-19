
import React from "react";
import { Button } from "@/components/ui/button";

interface DebugButtonsProps {
  onShowReport: () => void;
  onCheckEmbeddings: () => void;
}

const DebugButtons = ({ onShowReport, onCheckEmbeddings }: DebugButtonsProps) => {
  return (
    <div className="text-xs text-gray-400 mt-2 flex space-x-2">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onShowReport}
      >
        Afficher le rapport dans la console
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onCheckEmbeddings}
      >
        Vérifier les embeddings bruts
      </Button>
    </div>
  );
};

export default DebugButtons;
