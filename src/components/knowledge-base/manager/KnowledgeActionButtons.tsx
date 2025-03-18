
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";

interface KnowledgeActionButtonsProps {
  onAddEntry: () => void;
  onBatchImport: () => void;
}

const KnowledgeActionButtons = ({ onAddEntry, onBatchImport }: KnowledgeActionButtonsProps) => {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onBatchImport}>
        <Upload className="h-4 w-4 mr-2" />
        Import par lot
      </Button>
      <Button onClick={onAddEntry}>
        <Plus className="h-4 w-4 mr-2" />
        Nouvelle entrée
      </Button>
    </div>
  );
};

export default KnowledgeActionButtons;
