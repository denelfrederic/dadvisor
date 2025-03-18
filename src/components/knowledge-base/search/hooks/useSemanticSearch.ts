
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendMessageToGemini } from "../../../chat/services";
import { searchLocalDocuments } from "../../../chat/services/documentService";

export const useSemanticSearch = () => {
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = (message: string) => {
    console.log(message);
    setDebugLogs(prev => [...prev, message]);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      toast({
        title: "Question vide",
        description: "Veuillez entrer une question pour la recherche sémantique.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setResponse("");
    setSources([]);
    setDebugLogs([]); // Reset logs
    
    addLog(`[${new Date().toISOString()}] Starting semantic search for: "${query}"`);
    
    try {
      // Recherche sémantique dans les documents avec embeddings
      addLog(`Performing semantic vector search...`);
      const searchResults = await searchLocalDocuments(query);
      
      addLog(`Retrieved ${searchResults.length} semantically similar documents`);
      
      if (searchResults.length > 0) {
        // Log details about top semantic matches
        searchResults.slice(0, 3).forEach((doc, idx) => {
          addLog(`Top semantic match #${idx + 1}: "${doc.title || 'Untitled'}" (similarity: ${(doc.score || 0).toFixed(3)})`);
        });
        
        // Formatage du contexte pour Gemini avec plus d'emphase sur la pertinence sémantique
        const context = "Voici les documents sémantiquement similaires à votre requête :\n\n" +
          searchResults
            .map((doc, index) => 
              `[Document ${index + 1}: ${doc.title || 'Sans titre'} - Similarité: ${(doc.score || 0).toFixed(2)}]\n${doc.content.substring(0, 1500)}${doc.content.length > 1500 ? '...' : ''}`)
            .join('\n\n');
        
        const usedSources = searchResults.map(doc => 
          `Document: ${doc.title || 'Sans titre'} (Similarité: ${(doc.score || 0).toFixed(2)})`
        );
        
        // Instructions plus précises pour Gemini avec recherche sémantique
        const prompt = 
          "Tu es un assistant spécialisé dans la finance qui utilise la recherche sémantique. La question de l'utilisateur a été analysée et les documents les plus proches sémantiquement ont été identifiés. " +
          "Utilise ces documents pour répondre à la question, en tenant compte que la pertinence est basée sur la similarité sémantique plutôt que sur des correspondances exactes de mots-clés. " +
          "Si les documents ne contiennent pas d'information pertinente, indique-le clairement.\n\n" +
          "Question: " + query;
        
        addLog(`Sending request to Gemini with semantic context...`);
        const result = await sendMessageToGemini(prompt, [], true, context);
        addLog(`Received response from Gemini (${result.length} characters)`);
        
        setResponse(result);
        setSources([...usedSources]);
      } else {
        // Message spécifique pour l'absence de résultats sémantiques
        addLog(`No semantically similar documents found`);
        setResponse("Aucun document sémantiquement similaire n'a été trouvé dans notre base documentaire. Cela peut être dû à l'absence de documents avec des embeddings vectoriels ou à une faible similarité avec votre requête.");
        setSources(["Aucun document sémantiquement similaire trouvé"]);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche sémantique:", error);
      addLog(`SEMANTIC SEARCH ERROR: ${error instanceof Error ? error.message : String(error)}`);
      
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche sémantique. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      addLog(`[${new Date().toISOString()}] Semantic search completed`);
      setIsSearching(false);
    }
  };

  return {
    response,
    sources,
    isSearching,
    handleSearch,
    debugLogs
  };
};
