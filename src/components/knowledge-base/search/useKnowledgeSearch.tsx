
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeEntry } from "../types";
import { useKnowledgeBaseService } from "../services";
import { sendMessageToGemini } from "../../chat/services";

export const useKnowledgeSearch = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("internet");
  const [includeLocalContent, setIncludeLocalContent] = useState(false);
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
  const { toast } = useToast();
  const kb = useKnowledgeBaseService();

  useEffect(() => {
    // Load knowledge entries when component mounts
    const loadEntries = async () => {
      const entries = await kb.getEntries();
      setKnowledgeEntries(entries);
    };
    
    loadEntries();
  }, []);

  const handleInternetSearch = async () => {
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
      
      // Si l'option est activée, inclure également le contenu local
      if (includeLocalContent) {
        const searchResults = await kb.searchEntries(query);
        
        if (searchResults.length > 0) {
          context = searchResults
            .map(entry => `Q: ${entry.question}\nA: ${entry.answer}`)
            .join('\n\n');
          
          usedSources = searchResults.map(entry => 
            `Base de connaissances: ${entry.question.substring(0, 50)}${entry.question.length > 50 ? '...' : ''}`
          );
          
          console.log("Contenu local inclus dans la recherche Internet:", searchResults.length, "entrées");
        }
      }
      
      // Utiliser Gemini pour la recherche Internet, avec ou sans contexte local
      const result = await sendMessageToGemini(
        query, 
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

  const handleLocalSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Question vide",
        description: "Veuillez entrer une question pour la recherche locale.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setResponse("");
    setSources([]);
    
    try {
      // Rechercher dans la base de connaissances locale
      const searchResults = await kb.searchEntries(query);
      let usedSources: string[] = [];
      
      if (searchResults.length > 0) {
        // Utiliser les résultats de la recherche comme contexte pour Gemini
        const context = searchResults
          .map(entry => `Q: ${entry.question}\nA: ${entry.answer}`)
          .join('\n\n');
        
        usedSources = searchResults.map(entry => 
          `Base de connaissances: ${entry.question.substring(0, 50)}${entry.question.length > 50 ? '...' : ''}`
        );
        
        const result = await sendMessageToGemini(query, [], true, context);
        setResponse(result);
        setSources([...usedSources, "Augmenté par Gemini"]);
      } else {
        // Aucun résultat trouvé, utiliser Gemini sans contexte
        const result = await sendMessageToGemini(
          query, 
          [], 
          true, 
          "Aucune information pertinente trouvée dans la base de connaissances locale."
        );
        setResponse(result);
        setSources(["Aucune information pertinente dans la base locale", "Réponse fournie par Gemini"]);
      }
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

  const handleSearch = () => {
    if (activeTab === "internet") {
      handleInternetSearch();
    } else {
      handleLocalSearch();
    }
  };

  return {
    query,
    setQuery,
    response,
    sources,
    isSearching,
    activeTab,
    setActiveTab,
    includeLocalContent,
    setIncludeLocalContent,
    handleSearch
  };
};
