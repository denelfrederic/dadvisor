
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
    // Chargement des entrées de la base de connaissances au montage
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
        // Utiliser une recherche plus précise pour trouver le contenu pertinent
        const searchResults = await kb.searchEntries(query);
        
        if (searchResults.length > 0) {
          // Format plus structuré pour le contexte
          context = "Information de notre base de connaissances :\n\n" + 
            searchResults
              .map((entry, index) => 
                `[Source ${index + 1}]\nQuestion: ${entry.question}\nRéponse: ${entry.answer}`)
              .join('\n\n');
          
          // Sources plus descriptives
          usedSources = searchResults.map(entry => 
            `Base de connaissances: ${entry.question}`
          );
          
          console.log("Contenu local inclus dans la recherche Internet:", searchResults.length, "entrées");
        }
      }
      
      // Instructions plus précises pour Gemini
      const promptPrefix = includeLocalContent && context 
        ? "Analyse soigneusement les informations fournies de notre base de connaissances et utilise-les pour répondre à la question suivante. " +
          "Si les informations sont pertinentes, base ta réponse dessus. Sinon, utilise tes connaissances générales.\n\n" +
          "Question: "
        : "";
      
      // Utiliser Gemini pour la recherche Internet
      const result = await sendMessageToGemini(
        promptPrefix + query, 
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
      // Recherche améliorée dans la base de connaissances locale
      const searchResults = await kb.searchEntries(query);
      let usedSources: string[] = [];
      
      if (searchResults.length > 0) {
        // Formatage amélioré du contexte pour Gemini
        const context = "Voici les informations pertinentes de notre base de connaissances :\n\n" +
          searchResults
            .map((entry, index) => 
              `[Source ${index + 1}]\nQuestion: ${entry.question}\nRéponse: ${entry.answer}`)
            .join('\n\n');
        
        usedSources = searchResults.map(entry => 
          `Base de connaissances: ${entry.question}`
        );
        
        // Instructions plus précises pour Gemini
        const prompt = 
          "Tu es un assistant spécialisé dans la finance. Tu dois répondre à la question suivante en utilisant UNIQUEMENT les informations fournies de notre base de connaissances. " +
          "Si les informations ne contiennent pas d'éléments pertinents pour répondre, indique clairement: 'Je ne trouve pas d'information spécifique sur ce sujet dans notre base de connaissances.'\n\n" +
          "Question: " + query;
        
        const result = await sendMessageToGemini(prompt, [], true, context);
        setResponse(result);
        setSources([...usedSources]);
      } else {
        // Si aucun résultat local, message plus clair
        const result = await sendMessageToGemini(
          "Tu es un assistant spécialisé dans la finance. La question suivante a été posée, mais aucune information pertinente n'a été trouvée dans notre base de connaissances locale. " +
          "Réponds en indiquant clairement au début que cette information ne se trouve pas dans notre base locale, puis propose une réponse générale si possible.\n\n" +
          "Question: " + query, 
          [], 
          false, 
          ""
        );
        setResponse(result);
        setSources(["Aucune information pertinente dans la base locale", "Réponse générale via Gemini"]);
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
