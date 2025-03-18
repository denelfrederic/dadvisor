
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { KnowledgeEntry } from "../types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface KnowledgeEntryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentEntry: Partial<KnowledgeEntry>;
  setCurrentEntry: (entry: Partial<KnowledgeEntry>) => void;
  isEditing: boolean;
  onSave: () => Promise<void>;
}

const KnowledgeEntryDialog = ({
  isOpen,
  onOpenChange,
  currentEntry,
  setCurrentEntry,
  isEditing,
  onSave
}: KnowledgeEntryDialogProps) => {
  const { toast } = useToast();

  const handleSave = async () => {
    if (!currentEntry.question || !currentEntry.answer) {
      toast({
        title: "Champs obligatoires",
        description: "La question et la réponse sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    await onSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'entrée" : "Ajouter une nouvelle entrée"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="question" className="text-sm font-medium">
              Question
            </label>
            <Input
              id="question"
              value={currentEntry.question || ""}
              onChange={(e) => setCurrentEntry({...currentEntry, question: e.target.value})}
              placeholder="Qu'est-ce que l'inflation ?"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="answer" className="text-sm font-medium">
              Réponse
            </label>
            <Textarea
              id="answer"
              value={currentEntry.answer || ""}
              onChange={(e) => setCurrentEntry({...currentEntry, answer: e.target.value})}
              placeholder="L'inflation est..."
              className="min-h-[120px]"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="source" className="text-sm font-medium">
              Source (optionnel)
            </label>
            <Input
              id="source"
              value={currentEntry.source || ""}
              onChange={(e) => setCurrentEntry({...currentEntry, source: e.target.value})}
              placeholder="Banque de France, Article..."
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            {isEditing ? "Mettre à jour" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeEntryDialog;
