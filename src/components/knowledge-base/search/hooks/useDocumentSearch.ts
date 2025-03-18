
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendMessageToGemini } from "../../../chat/services";
import { searchLocalDocuments } from "../../../chat/services/document/searchService";

export const useDocumentSearch = () => {
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
        description: "Veuillez entrer une question pour la recherche documentaire.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setResponse("");
    setSources([]);
    setDebugLogs([]); // Reset logs
    
    addLog(`[${new Date().toISOString()}] Starting document search for: "${query}"`);
    
    try {
      // Recherche dans les documents
      addLog(`Searching in local document repository...`);
      const searchResults = await searchLocalDocuments(query);
      
      addLog(`Retrieved ${searchResults.length} document results`);
      
      if (searchResults.length > 0) {
        // Log some details about top results
        searchResults.slice(0, 3).forEach((doc, idx) => {
          addLog(`Top result #${idx + 1}: "${doc.title || 'Untitled'}" (score: ${doc.score?.toFixed(2) || 'N/A'})`);
        });
        
        // Formatage du contexte pour Gemini
        const context = "Voici les documents pertinents de notre base documentaire :\n\n" +
          searchResults
            .map((doc, index) => 
              `[Document ${index + 1}: ${doc.title || 'Sans titre'}]\n${doc.content.substring(0, 1500)}${doc.content.length > 1500 ? '...' : ''}`)
            .join('\n\n');
        
        const usedSources = searchResults.map(doc => 
          `Document: ${doc.title || 'Sans titre'} (Score: ${doc.score?.toFixed(2) || 'N/A'})`
        );
        
        // Instructions pour Gemini
        const prompt = 
          "Tu es un assistant spécialisé dans la finance. Tu dois répondre à la question suivante en utilisant UNIQUEMENT les informations fournies dans les documents ci-dessous. " +
          "Si les documents ne contiennent pas d'éléments pertinents pour répondre, indique clairement: 'Je ne trouve pas d'information spécifique sur ce sujet dans notre base documentaire.'\n\n" +
          "Question: " + query;
        
        addLog(`Sending request to Gemini with document context...`);
        const result = await sendMessageToGemini(prompt, [], true, context);
        addLog(`Received response from Gemini (${result.length} characters)`);
        
        setResponse(result);
        setSources([...usedSources]);
      } else {
        // Si aucun résultat, message plus clair
        addLog(`No relevant documents found in repository`);
        setResponse("Aucun document pertinent n'a été trouvé dans notre base documentaire pour répondre à cette question.");
        setSources(["Aucun document pertinent trouvé"]);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche documentaire:", error);
      addLog(`SEARCH ERROR: ${error instanceof Error ? error.message : String(error)}`);
      
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche documentaire. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      addLog(`[${new Date().toISOString()}] Document search completed`);
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
