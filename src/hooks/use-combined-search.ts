
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useKnowledgeBaseService } from "@/components/knowledge-base/services";
import { sendMessageToGemini } from "@/components/chat/services/geminiService";
import { searchEntriesWithPinecone } from "@/components/knowledge-base/services/search/searchService";
import { searchLocalDocuments } from "@/components/chat/services/document/searchService";

export interface CombinedSearchResult {
  response: string;
  sources: string[];
  isSearching: boolean;
  debugLogs: string[];
}

/**
 * Hook pour effectuer une recherche combinée utilisant RAG + Pinecone + Internet
 * Ce hook centralise la recherche en utilisant toutes les ressources disponibles
 */
export const useCombinedSearch = () => {
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const { toast } = useToast();
  const kb = useKnowledgeBaseService();

  // Fonction utilitaire pour ajouter des logs de débogage
  const addLog = useCallback((message: string) => {
    console.log(message);
    setDebugLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  }, []);

  /**
   * Effectue une recherche complète en utilisant:
   * 1. Pinecone pour la vectorisation sémantique
   * 2. Base de connaissances locale
   * 3. Documents stockés
   * 4. Internet via OpenAI GPT-4o
   */
  const handleSearch = useCallback(async (query: string) => {
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
    setDebugLogs([`[${new Date().toISOString()}] Démarrage de la recherche combinée pour: "${query}"`]);

    try {
      // 1. Récupérer les entrées de la base de connaissances via Pinecone
      addLog("Recherche dans la base de connaissances via Pinecone");
      const kbEntries = await searchEntriesWithPinecone(query, 5);
      
      // 2. Rechercher des documents pertinents
      addLog("Recherche dans les documents stockés");
      const docResults = await searchLocalDocuments(query);
      
      addLog(`Trouvé ${kbEntries.length} entrées KB et ${docResults.length} documents`);

      // 3. Construire le contexte à partir des résultats trouvés
      let context = "";
      let usedSources: string[] = [];
      
      // Ajouter les entrées de la base de connaissances au contexte
      if (kbEntries.length > 0) {
        context += "Information de notre base de connaissances DADVISOR:\n\n" + 
          kbEntries
            .map((entry, index) => 
              `[Source KB ${index + 1}]\nQuestion: ${entry.question}\nRéponse: ${entry.answer}`)
            .join('\n\n');
            
        usedSources.push(...kbEntries.map(entry => 
          `Base de connaissances: ${entry.question} (similarité: ${entry.similarity || 'N/A'})`
        ));
      }
      
      // Ajouter les résultats des documents au contexte
      if (docResults.length > 0) {
        if (context) context += "\n\n";
        context += "Information de nos documents DADVISOR:\n\n" + 
          docResults
            .map((doc, index) => 
              `[Document ${index + 1}: ${doc.title || 'Sans titre'}]\n${doc.content.substring(0, 1000)}${doc.content.length > 1000 ? '...' : ''}`)
            .join('\n\n');
            
        usedSources.push(...docResults.map(doc => 
          `Document: ${doc.title || 'Sans titre'} (Score: ${doc.score?.toFixed(2) || 'N/A'})`
        ));
      }

      // 4. Utiliser OpenAI pour générer une réponse incluant les informations Internet
      addLog("Envoi de la requête à OpenAI GPT-4o avec contexte local et recherche Internet");
      
      // Instructions pour GPT-4o
      const prompt = 
        "Tu es l'assistant IA de DADVISOR, spécialisé dans la finance et l'investissement. " +
        "Utilise à la fois les informations fournies dans le contexte local ET tes connaissances générales pour donner une réponse complète et pertinente. " +
        "Cite explicitement les sources locales lorsque tu les utilises et indique quand tu utilises tes connaissances générales. " +
        "IMPORTANT: Réponds de manière pédagogique, concise mais complète, et adapte le niveau technique à un investisseur amateur. " +
        "Question de l'utilisateur DADVISOR: " + query;
      
      const result = await sendMessageToGemini(prompt, [], true, context);
      
      addLog(`Réponse reçue de OpenAI GPT-4o (${result.length} caractères)`);
      
      // 5. Mettre à jour l'état avec les résultats
      setResponse(result);
      
      // Ajouter OpenAI comme source
      if (usedSources.length > 0) {
        setSources([...usedSources, "Recherche Internet via OpenAI GPT-4o"]);
      } else {
        setSources(["Recherche Internet via OpenAI GPT-4o"]);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche combinée:", error);
      addLog(`ERREUR: ${error instanceof Error ? error.message : String(error)}`);
      
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      addLog("Recherche combinée terminée");
      setIsSearching(false);
    }
  }, [kb, toast, addLog]);

  // Nettoyer les résultats
  const resetSearch = useCallback(() => {
    setResponse("");
    setSources([]);
    setDebugLogs([]);
  }, []);

  return {
    response,
    sources,
    isSearching,
    debugLogs,
    handleSearch,
    resetSearch
  };
};
