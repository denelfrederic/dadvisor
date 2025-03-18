
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useKnowledgeBaseService } from "../../services";
import { sendMessageToGemini } from "../../../chat/services";
import { searchKnowledgeBase, searchDocuments, buildPromptForLocalContent } from "../utils/searchUtils";

export const useInternetSearch = () => {
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const kb = useKnowledgeBaseService();

  // Use useCallback to memoize the search function
  const handleSearch = useCallback(async (query: string, includeLocalContent: boolean) => {
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
    setSources([]);
    
    try {
      let context = "";
      let usedSources: string[] = [];
      
      // Si l'option est activée, inclure tout le contenu local (base de connaissances ET documents)
      if (includeLocalContent) {
        // Process local content in parallel for better performance
        const [kbResults, docResults] = await Promise.all([
          searchKnowledgeBase(kb, query),
          searchDocuments(query)
        ]);
        
        // Combine results
        if (kbResults.context) {
          context += kbResults.context + "\n\n";
          usedSources = [...usedSources, ...kbResults.sources];
        }
        
        if (docResults.context) {
          context += docResults.context + "\n\n";
          usedSources = [...usedSources, ...docResults.sources];
        }
      }
      
      // Instructions plus précises pour Gemini
      const promptPrefix = buildPromptForLocalContent(query, includeLocalContent && context.length > 0, context);
      
      // Utiliser Gemini pour la recherche Internet
      const result = await sendMessageToGemini(
        promptPrefix, 
        [], 
        includeLocalContent, 
        includeLocalContent ? context : ""
      );
      
      setResponse(result);
      setSources([...usedSources, "Recherche Internet via Gemini"]);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  }, [kb, toast]);

  return {
    response,
    sources,
    isSearching,
    handleSearch
  };
};
