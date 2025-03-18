
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeEntry } from "./types";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (entries: KnowledgeEntry[]) => void;
}

const ImportDialog = ({ open, onOpenChange, onImport }: ImportDialogProps) => {
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
    };
    
    reader.readAsText(file);
  };
  
  const extractQAPairs = (text: string, fileName: string): KnowledgeEntry[] => {
    const entries: KnowledgeEntry[] = [];
    
    // Split the text into paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    
    // For each paragraph, try to create a knowledge entry
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.trim().length < 20) return; // Ignore paragraphs that are too short
      
      // Create a "question" based on the first line or first few words
      let question = "";
      let answer = paragraph.trim();
      
      // Try to extract a title or first sentence as the question
      const lines = paragraph.split('\n');
      if (lines[0] && lines[0].trim().length > 0 && lines[0].trim().length < 200) {
        question = lines[0].trim();
        answer = paragraph.substring(question.length).trim();
      } else {
        // If no obvious title, take the first few words
        const words = paragraph.trim().split(' ');
        question = words.slice(0, Math.min(10, words.length)).join(' ');
        if (question.length > 100) {
          question = question.substring(0, 100) + '...';
        }
      }
      
      if (question && answer) {
        entries.push({
          id: Date.now() + '-' + index,
          question,
          answer,
          source: fileName,
          timestamp: Date.now()
        });
      }
    });
    
    return entries;
  };
  
  const handleImport = () => {
    if (!fileContent || !fileName) {
      toast({
        title: "Erreur d'importation",
        description: "Veuillez d'abord sélectionner un fichier.",
        variant: "destructive"
      });
      return;
    }

    const extractedEntries = extractQAPairs(fileContent, fileName);
    
    if (extractedEntries.length === 0) {
      toast({
        title: "Importation vide",
        description: "Aucune donnée exploitable n'a pu être extraite du document.",
        variant: "destructive"
      });
      return;
    }

    onImport(extractedEntries);
    setFileContent("");
    setFileName("");
    onOpenChange(false);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importer un document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="import-file" className="text-sm font-medium">Fichier (.txt, .md, .csv, .json)</label>
            <Input
              id="import-file"
              type="file"
              accept=".txt,.md,.csv,.json"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Le système tentera d'extraire des paires question-réponse du document.
            </p>
          </div>
          {fileName && (
            <div className="text-sm">
              <p className="font-medium">Fichier sélectionné : {fileName}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {fileContent ? `${fileContent.length} caractères chargés` : 'Chargement du contenu...'}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button onClick={handleImport} disabled={!fileContent}>Importer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
