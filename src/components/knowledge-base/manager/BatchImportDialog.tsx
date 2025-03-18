
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useKnowledgeBaseService } from "../services";
import { KnowledgeEntry } from "../types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface BatchImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

interface ParsedEntry {
  question: string;
  answer: string;
}

const BatchImportDialog = ({
  isOpen,
  onOpenChange,
  onImportComplete
}: BatchImportDialogProps) => {
  const [content, setContent] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const kb = useKnowledgeBaseService();

  const parseContent = (text: string): ParsedEntry[] => {
    // Extract Q&A pairs from the text
    const entries: ParsedEntry[] = [];
    const lines = text.split("\n");
    
    let currentQuestion = "";
    let currentAnswer = "";
    let isReadingAnswer = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Detect question pattern (e.g., "Q1 :", "Q1:", "Question 1 :", etc.)
      const questionMatch = line.match(/^Q(\d+)\s*:(.+)$/i) || line.match(/^Question\s*(\d+)\s*:(.+)$/i);
      
      if (questionMatch) {
        // If we were reading an answer, save the previous Q&A pair
        if (currentQuestion && currentAnswer) {
          entries.push({
            question: currentQuestion,
            answer: currentAnswer.trim()
          });
        }
        
        // Start a new question
        currentQuestion = questionMatch[2].trim();
        currentAnswer = "";
        isReadingAnswer = true;
      } else if (isReadingAnswer) {
        // Continue building the answer
        currentAnswer += (currentAnswer ? "\n" : "") + line;
      }
    }
    
    // Add the last Q&A pair if it exists
    if (currentQuestion && currentAnswer) {
      entries.push({
        question: currentQuestion,
        answer: currentAnswer.trim()
      });
    }
    
    return entries;
  };

  const handleImport = async () => {
    if (!content.trim()) {
      toast({
        title: "Contenu vide",
        description: "Veuillez entrer du contenu à importer",
        variant: "destructive"
      });
      return;
    }
    
    const parsedEntries = parseContent(content);
    
    if (parsedEntries.length === 0) {
      toast({
        title: "Aucune entrée détectée",
        description: "Le format du contenu n'a pas permis de détecter des questions et réponses",
        variant: "destructive"
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      let successCount = 0;
      
      // Add entries one by one
      for (const entry of parsedEntries) {
        const result = await kb.addEntry({
          question: entry.question,
          answer: entry.answer,
          source: "Import par lot"
        });
        
        if (result) {
          successCount++;
        }
      }
      
      toast({
        title: "Import réussi",
        description: `${successCount} sur ${parsedEntries.length} entrées importées avec succès`,
      });
      
      setContent("");
      onOpenChange(false);
      onImportComplete();
    } catch (error) {
      console.error("Erreur lors de l'import par lot:", error);
      toast({
        title: "Erreur d'import",
        description: "Une erreur est survenue lors de l'import des entrées",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Import par lot
          </DialogTitle>
          <DialogDescription>
            Collez du contenu Q&A pour l'ajouter à la base de connaissances.
            Le format attendu est "Q1 : Question" suivi de la réponse sur les lignes suivantes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Contenu à importer
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Q1 : Quelle est la structure juridique...
DADVISOR DAO est une association..."
              className="min-h-[300px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Annuler
          </Button>
          <Button onClick={handleImport} disabled={isImporting}>
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importation...
              </>
            ) : (
              "Importer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BatchImportDialog;
