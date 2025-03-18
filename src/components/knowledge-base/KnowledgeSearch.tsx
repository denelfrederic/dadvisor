
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
      // Improved search algorithm with better matching logic
      const searchText = query.toLowerCase();
      
      // Extract meaningful words (filter out common stop words)
      const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'et', 'est', 'sont', 'pour', 'dans', 'avec', 'comment', 'quels', 'quelles', 'que', 'qui', 'quoi'];
      const searchTerms = searchText.split(/\s+/)
        .filter(term => term.length > 2)
        .filter(term => !stopWords.includes(term));
      
      console.log("Termes de recherche:", searchTerms);
      
      if (searchTerms.length === 0) {
        setLocalResponse("Veuillez formuler votre question avec des termes plus spécifiques.");
        setIsSearching(false);
        return;
      }
      
      // Score each entry using a more sophisticated algorithm
      const scoredEntries = knowledgeBase.map(entry => {
        const questionText = entry.question.toLowerCase();
        const answerText = entry.answer.toLowerCase();
        
        let score = 0;
        let exactPhraseMatch = false;
        
        // Check for exact phrase matches (highest priority)
        if (questionText.includes(searchText)) {
          score += 10;
          exactPhraseMatch = true;
        }
        
        // Weighted term matching
        searchTerms.forEach(term => {
          // Count occurrences for higher weighting of repeated terms
          const questionOccurrences = (questionText.match(new RegExp(`\\b${term}\\b`, 'gi')) || []).length;
          const answerOccurrences = (answerText.match(new RegExp(`\\b${term}\\b`, 'gi')) || []).length;
          
          // Question matches have higher weight
          score += questionOccurrences * 2;
          score += answerOccurrences;
          
          // Partial matching for longer terms (minimum 5 chars)
          if (term.length >= 5) {
            if (questionText.includes(term)) score += 1;
            if (answerText.includes(term)) score += 0.5;
          }
        });
        
        // Bonus for entries that match multiple terms
        const matchedTermsInQuestion = searchTerms.filter(term => questionText.includes(term));
        const matchedTermsInAnswer = searchTerms.filter(term => answerText.includes(term));
        
        // Bonus for coverage of search terms
        const coverageScore = (matchedTermsInQuestion.length + matchedTermsInAnswer.length * 0.5) / searchTerms.length;
        score += coverageScore * 3;
        
        // Exact phrase matches get a significant boost
        if (exactPhraseMatch) {
          score *= 1.5;
        }
        
        return { 
          entry, 
          score,
          matchedTerms: [...new Set([...matchedTermsInQuestion, ...matchedTermsInAnswer])]
        };
      });
      
      console.log("Entrées scorées:", scoredEntries.map(e => ({ 
        question: e.entry.question, 
        score: e.score, 
        matchedTerms: e.matchedTerms 
      })));
      
      // Sort by score and take the best match
      scoredEntries.sort((a, b) => b.score - a.score);
      const threshold = 1.0; // Minimum score to consider a valid match
      
      const bestMatch = scoredEntries.length > 0 && scoredEntries[0].score >= threshold 
        ? scoredEntries[0] 
        : null;
      
      if (bestMatch) {
        console.log("Meilleure correspondance:", bestMatch.entry.question, "avec score:", bestMatch.score);
        setLocalResponse(bestMatch.entry.answer);
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
