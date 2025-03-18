
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { KnowledgeEntry } from "./types";

interface EditEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEntry: KnowledgeEntry | null;
  onUpdate: (question: string, answer: string) => void;
}

const EditEntryDialog = ({ open, onOpenChange, currentEntry, onUpdate }: EditEntryDialogProps) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  
  useEffect(() => {
    if (currentEntry && open) {
      setQuestion(currentEntry.question);
      setAnswer(currentEntry.answer);
    }
  }, [currentEntry, open]);
  
  const handleUpdate = () => {
    if (!question.trim() || !answer.trim()) {
      return;
    }
    
    onUpdate(question, answer);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier l'entrée</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="edit-question" className="text-sm font-medium">Question</label>
            <Input
              id="edit-question"
              placeholder="Entrez une question financière..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-answer" className="text-sm font-medium">Réponse</label>
            <Textarea
              id="edit-answer"
              placeholder="Entrez la réponse à cette question..."
              rows={6}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button onClick={handleUpdate}>Mettre à jour</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditEntryDialog;
