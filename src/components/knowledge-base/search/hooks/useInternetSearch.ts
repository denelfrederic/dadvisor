
import { useState } from "react";
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

  const handleSearch = async (query: string, includeLocalContent: boolean) => {
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
        // 1. Recherche dans la base de connaissances
        const kbResults = await searchKnowledgeBase(kb, query);
        
        if (kbResults.context) {
          context += kbResults.context + "\n\n";
          usedSources = [...usedSources, ...kbResults.sources];
          console.log("Contenu de la base de connaissances inclus:", kbResults.sources.length, "entrées");
        }
        
        // 2. Recherche dans les documents
        const docResults = await searchDocuments(query);
        
        if (docResults.context) {
          context += docResults.context + "\n\n";
          usedSources = [...usedSources, ...docResults.sources];
          console.log("Contenu des documents inclus:", docResults.sources.length, "documents");
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
  };

  return {
    response,
    sources,
    isSearching,
    handleSearch
  };
};
