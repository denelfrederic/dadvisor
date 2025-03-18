
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendMessageToGemini } from "../../../chat/services";
import { searchLocalDocuments } from "../../../chat/services/document/searchService";
import { DocumentSearchResult } from "../../../chat/types";

export const useDocumentSearch = () => {
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<DocumentSearchResult[]>([]);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = useCallback((message: string) => {
    console.log(message);
    setDebugLogs(prev => [...prev, message]);
  }, []);

  const resetSearchState = useCallback(() => {
    setResponse("");
    setSources([]);
    setSearchResults([]);
    setDebugLogs([]);
  }, []);

  const searchDocuments = useCallback(async (query: string): Promise<DocumentSearchResult[]> => {
    try {
      addLog(`Searching in local document repository...`);
      const results = await searchLocalDocuments(query);
      
      addLog(`Retrieved ${results.length} document results`);
      
      if (results.length > 0) {
        results.slice(0, 3).forEach((doc, idx) => {
          addLog(`Top result #${idx + 1}: "${doc.title || 'Untitled'}" (score: ${doc.score?.toFixed(2) || 'N/A'})`);
        });
      } else {
        addLog('No relevant documents found');
      }
      
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`ERROR searching documents: ${errorMessage}`);
      throw new Error(`Failed to search documents: ${errorMessage}`);
    }
  }, [addLog]);

  const formatDocumentContext = useCallback((searchResults: DocumentSearchResult[]): string => {
    if (searchResults.length === 0) return "";
    
    return "Voici les documents pertinents de notre base documentaire :\n\n" +
      searchResults.map((doc, index) => 
        `[Document ${index + 1}: ${doc.title || 'Sans titre'}]\n${doc.content.substring(0, 1500)}${doc.content.length > 1500 ? '...' : ''}`
      ).join('\n\n');
  }, []);

  const generateSourceCitations = useCallback((searchResults: DocumentSearchResult[]): string[] => {
    if (searchResults.length === 0) return ["Aucun document pertinent trouvé"];
    
    return searchResults.map(doc => 
      `Document: ${doc.title || 'Sans titre'} (Score: ${doc.score?.toFixed(2) || 'N/A'})`
    );
  }, []);

  const queryAIWithContext = useCallback(async (query: string, context: string): Promise<string> => {
    try {
      addLog(`Sending request to Gemini with document context...`);
      
      const prompt = 
        "Tu es un assistant spécialisé dans la finance. Tu dois répondre à la question suivante en utilisant UNIQUEMENT les informations fournies dans les documents ci-dessous. " +
        "Si les documents ne contiennent pas d'éléments pertinents pour répondre, indique clairement: 'Je ne trouve pas d'information spécifique sur ce sujet dans notre base documentaire.'\n\n" +
        "Question: " + query;
      
      const result = await sendMessageToGemini(prompt, [], true, context);
      addLog(`Received response from Gemini (${result.length} characters)`);
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`ERROR querying AI: ${errorMessage}`);
      throw new Error(`Failed to get AI response: ${errorMessage}`);
    }
  }, [addLog]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      toast({
        title: "Question vide",
        description: "Veuillez entrer une question pour la recherche documentaire.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    resetSearchState();
    
    addLog(`[${new Date().toISOString()}] Starting document search for: "${query}"`);
    
    try {
      // Step 1: Search for relevant documents
      const results = await searchDocuments(query);
      setSearchResults(results);
      
      // Step 2: Process results and generate response
      if (results.length > 0) {
        // Format context and prepare source citations
        const context = formatDocumentContext(results);
        const usedSources = generateSourceCitations(results);
        
        // Get AI response using the document context
        const aiResponse = await queryAIWithContext(query, context);
        
        setResponse(aiResponse);
        setSources(usedSources);
      } else {
        // Handle case with no results
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
      
      setResponse("Une erreur est survenue lors de la recherche. Veuillez réessayer.");
    } finally {
      addLog(`[${new Date().toISOString()}] Document search completed`);
      setIsSearching(false);
    }
  }, [
    toast, 
    resetSearchState, 
    addLog, 
    searchDocuments, 
    formatDocumentContext, 
    generateSourceCitations, 
    queryAIWithContext
  ]);

  return {
    response,
    sources,
    searchResults,
    isSearching,
    handleSearch,
    debugLogs
  };
};
