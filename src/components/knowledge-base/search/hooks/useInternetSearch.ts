
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useKnowledgeBaseService } from "../../services";
import { sendMessageToGemini } from "../../../chat/services";
import { searchKnowledgeBase, searchDocuments, buildPromptForLocalContent } from "../utils/searchUtils";

export const useInternetSearch = () => {
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const { toast } = useToast();
  const kb = useKnowledgeBaseService();

  // Helper to add logs
  const addLog = (message: string) => {
    console.log(message);
    setDebugLogs(prev => [...prev, message]);
  };

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
    setDebugLogs([]); // Reset logs
    
    addLog(`[${new Date().toISOString()}] Starting internet search with OpenAI for: "${query}" (include local: ${includeLocalContent})`);
    
    try {
      let context = "";
      let usedSources: string[] = [];
      
      // Si l'option est activée, inclure tout le contenu local (base de connaissances ET documents)
      if (includeLocalContent) {
        try {
          addLog(`Gathering local content to enhance internet search...`);
          // Process local content in parallel for better performance
          const [kbResults, docResults] = await Promise.all([
            searchKnowledgeBase(kb, query),
            searchDocuments(query)
          ]);
          
          // Combine results
          if (kbResults.context) {
            context += kbResults.context + "\n\n";
            usedSources = [...usedSources, ...kbResults.sources];
            addLog(`Added ${kbResults.sources.length} knowledge base entries to context`);
          }
          
          if (docResults.context) {
            context += docResults.context + "\n\n";
            usedSources = [...usedSources, ...docResults.sources];
            addLog(`Added ${docResults.sources.length} document snippets to context`);
          }
        } catch (localError) {
          console.error("Erreur lors de la recherche locale:", localError);
          addLog(`ERROR in local content search: ${localError instanceof Error ? localError.message : String(localError)}`);
          // Continue with internet search even if local search fails
          toast({
            title: "Attention",
            description: "La recherche dans le contenu local a échoué, mais la recherche internet continue.",
            variant: "default"
          });
        }
      }
      
      // Instructions plus précises pour OpenAI
      addLog(`Building prompt for OpenAI with${includeLocalContent ? '' : 'out'} local context...`);
      const promptPrefix = buildPromptForLocalContent(query, includeLocalContent && context.length > 0, context);
      
      // Utiliser OpenAI pour la recherche Internet (via la fonction sendMessageToGemini qui a maintenant été modifiée)
      addLog(`Sending request to OpenAI GPT-4o...`);
      const result = await sendMessageToGemini(
        promptPrefix, 
        [], 
        includeLocalContent, 
        includeLocalContent ? context : ""
      );
      
      addLog(`Received response from OpenAI (${result.length} characters)`);
      setResponse(result);
      setSources([...usedSources, "Recherche Internet via OpenAI GPT-4o"]);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      addLog(`SEARCH ERROR: ${error instanceof Error ? error.message : String(error)}`);
      // Let error propagate to ErrorBoundary
      throw new Error(
        error instanceof Error 
          ? error.message 
          : "Une erreur est survenue lors de la recherche Internet. Veuillez réessayer."
      );
    } finally {
      addLog(`[${new Date().toISOString()}] Internet search completed`);
      setIsSearching(false);
    }
  }, [kb, toast]);

  return {
    response,
    sources,
    isSearching,
    handleSearch,
    debugLogs
  };
};
