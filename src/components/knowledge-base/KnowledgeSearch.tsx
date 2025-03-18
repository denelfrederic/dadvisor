
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
  const [localResponse, setLocalResponse] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleLocalSearch = () => {
    if (!query.trim()) {
      toast({
        title: "Question vide",
        description: "Veuillez entrer une question pour rechercher dans la base de connaissances.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setLocalResponse("");
    
    // Simulate search delay
    setTimeout(() => {
      // Improved search to find the best match
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
      
      // Score each entry based on number of matching terms
      const scoredEntries = knowledgeBase.map(entry => {
        const questionText = entry.question.toLowerCase();
        const answerText = entry.answer.toLowerCase();
        
        let score = 0;
        searchTerms.forEach(term => {
          if (questionText.includes(term)) score += 2; // Question matches have more weight
          if (answerText.includes(term)) score += 1;
        });
        
        return { entry, score };
      });
      
      // Sort by score and take the best match
      scoredEntries.sort((a, b) => b.score - a.score);
      const bestMatch = scoredEntries.length > 0 && scoredEntries[0].score > 0 
        ? scoredEntries[0].entry 
        : null;
      
      if (bestMatch) {
        setLocalResponse(bestMatch.answer);
      } else {
        setLocalResponse("Aucune réponse correspondante trouvée dans la base de connaissances locale. Essayez une autre question ou utilisez l'assistant Gemini pour une réponse plus générale.");
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
          onClick={handleLocalSearch} 
          disabled={isSearching || !query.trim()}
          className="w-full"
        >
          {isSearching ? "Recherche en cours..." : "Rechercher"}
        </Button>
      </div>
      
      {localResponse && (
        <div className="mt-6 p-4 rounded-lg bg-muted">
          <h4 className="font-medium mb-2">Réponse:</h4>
          <p className="text-sm whitespace-pre-line">{localResponse}</p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeSearch;
