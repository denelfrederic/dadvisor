
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeEntry } from "./types";

interface KnowledgeSearchProps {
  knowledgeBase: KnowledgeEntry[];
}

const KnowledgeSearch = ({ knowledgeBase }: KnowledgeSearchProps) => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = () => {
    if (!query.trim()) {
      toast({
        title: "Question vide",
        description: "Veuillez entrer une question pour effectuer une recherche.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setResponse("");
    
    // Simuler une recherche
    setTimeout(() => {
      // Recherche simple dans la base de connaissances
      const searchText = query.toLowerCase();
      const found = knowledgeBase.find(entry => 
        entry.question.toLowerCase().includes(searchText) ||
        entry.answer.toLowerCase().includes(searchText)
      );
      
      if (found) {
        setResponse(found.answer);
      } else {
        setResponse("Aucune information trouvée. Essayez de reformuler votre question ou utilisez l'option de recherche internet.");
      }
      
      setIsSearching(false);
    }, 300);
  };

  return (
    <div>
      <div className="space-y-4">
        <Textarea 
          placeholder="Posez votre question financière..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-[100px]"
        />
        
        <Button 
          onClick={handleSearch} 
          disabled={isSearching || !query.trim()}
          className="w-full"
        >
          {isSearching ? "Recherche en cours..." : "Rechercher"}
        </Button>
      </div>
      
      {response && (
        <div className="mt-6 p-4 rounded-lg bg-muted">
          <h4 className="font-medium mb-2">Réponse:</h4>
          <p className="text-sm whitespace-pre-line">{response}</p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeSearch;
