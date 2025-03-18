
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendMessageToGemini } from "../../../chat/services";
import { searchLocalDocuments } from "../../../chat/services/documentService";
import { useKnowledgeBaseService } from "../../services";
import { generateEmbedding } from "../../../chat/services/document/embeddingService";

export const useSemanticSearch = () => {
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const { toast } = useToast();
  const kb = useKnowledgeBaseService();

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
      // Generate embedding for the query
      addLog("Generating embedding for query...");
      const queryEmbedding = await generateEmbedding(query);
      
      if (!queryEmbedding) {
        addLog("ERROR: Could not generate embedding for query");
        throw new Error("Failed to generate embedding for query");
      }
      
      // Search in both knowledge base and documents
      addLog("Searching knowledge base by embedding similarity...");
      const kbResults = await kb.searchEntriesBySimilarity(queryEmbedding, 0.65, 3);
      
      addLog("Searching documents by embedding similarity...");
      const docResults = await searchLocalDocuments(query);
      
      addLog(`Retrieved ${kbResults.length} knowledge entries and ${docResults.length} documents`);
      
      // Combine results for context
      let context = "";
      const allSources: string[] = [];
      
      // Add knowledge base results to context
      if (kbResults.length > 0) {
        context += "Information de notre base de connaissances :\n\n" + 
          kbResults
            .map((entry, index) => 
              `[Base de connaissances ${index + 1}]\nQuestion: ${entry.question}\nRéponse: ${entry.answer}`)
            .join('\n\n');
            
        allSources.push(...kbResults.map(entry => 
          `Base de connaissances: ${entry.question}`
        ));
      }
      
      // Add document results to context
      if (docResults.length > 0) {
        if (context) context += "\n\n";
        context += "Information de nos documents :\n\n" + 
          docResults
            .map((doc, index) => 
              `[Document ${index + 1}: ${doc.title || 'Sans titre'}]\n${doc.content.substring(0, 1000)}${doc.content.length > 1000 ? '...' : ''}`)
            .join('\n\n');
            
        allSources.push(...docResults.map(doc => 
          `Document: ${doc.title || 'Sans titre'} (Score: ${doc.score?.toFixed(2) || 'N/A'})`
        ));
      }
      
      if (context) {
        // Instructions for Gemini with semantic search results
        const prompt = 
          "Tu es un assistant spécialisé dans la finance qui utilise la recherche sémantique. " +
          "Les documents et entrées de connaissances les plus proches sémantiquement de la question ont été identifiés. " +
          "Utilise ces informations pour répondre à la question, en tenant compte que la pertinence est basée sur la similarité sémantique. " +
          "Si les informations ne contiennent pas d'éléments pertinents pour répondre, indique-le clairement.\n\n" +
          "Question: " + query;
        
        addLog(`Sending request to Gemini with combined semantic context...`);
        const result = await sendMessageToGemini(prompt, [], true, context);
        addLog(`Received response from Gemini (${result.length} characters)`);
        
        setResponse(result);
        setSources([...allSources]);
      } else {
        // Message for no semantic results
        addLog(`No semantically similar content found`);
        setResponse("Aucun contenu sémantiquement similaire n'a été trouvé dans notre base documentaire ou de connaissances. Cela peut être dû à l'absence d'entrées avec des embeddings vectoriels ou à une faible similarité avec votre requête.");
        setSources(["Aucun contenu sémantiquement similaire trouvé"]);
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
