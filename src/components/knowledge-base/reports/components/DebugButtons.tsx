
import React from "react";
import { Button } from "@/components/ui/button";
import { Terminal, Database } from "lucide-react";

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
        className="flex items-center gap-1"
      >
        <Terminal className="h-3.5 w-3.5" />
        Afficher le rapport dans la console
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onCheckEmbeddings}
        className="flex items-center gap-1"
      >
        <Database className="h-3.5 w-3.5" />
        Vérifier les embeddings bruts
      </Button>
    </div>
  );
};

export default DebugButtons;
