
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { KnowledgeEntry } from "./types";
import { useToast } from "@/hooks/use-toast";

interface AddEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (question: string, answer: string) => void;
}

const AddEntryDialog = ({ open, onOpenChange, onAdd }: AddEntryDialogProps) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setQuestion("");
      setAnswer("");
    }
  }, [open]);

  const handleAdd = () => {
    if (!question.trim() || !answer.trim()) {
      toast({
        title: "Champs incomplets",
        description: "Veuillez remplir à la fois la question et la réponse.",
        variant: "destructive"
      });
      return;
    }

    onAdd(question, answer);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter une entrée</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="question" className="text-sm font-medium">Question</label>
            <Input
              id="question"
              placeholder="Entrez une question financière..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="answer" className="text-sm font-medium">Réponse</label>
            <Textarea
              id="answer"
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
          <Button onClick={handleAdd}>Ajouter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEntryDialog;
