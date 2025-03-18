
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeEntry } from "../types";
import { useKnowledgeBaseService } from "../services";
import { sendMessageToGemini } from "../../chat/services";
import { searchLocalDocuments, updateDocumentEmbeddings } from "../../chat/services/documentService";

export const useKnowledgeSearch = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("internet");
  const [includeLocalContent, setIncludeLocalContent] = useState(false);
  const [isUpdatingEmbeddings, setIsUpdatingEmbeddings] = useState(false);
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
      
      // Si l'option est activée, inclure tout le contenu local (base de connaissances ET documents)
      if (includeLocalContent) {
        // 1. Recherche dans la base de connaissances
        const kbResults = await kb.searchEntries(query);
        
        if (kbResults.length > 0) {
          // Format plus structuré pour le contexte de la base de connaissances
          const kbContext = kbResults
            .map((entry, index) => 
              `[Base de connaissances ${index + 1}]\nQuestion: ${entry.question}\nRéponse: ${entry.answer}`)
            .join('\n\n');
          
          context += "Information de notre base de connaissances :\n\n" + kbContext + "\n\n";
          
          // Sources plus descriptives
          usedSources = kbResults.map(entry => 
            `Base de connaissances: ${entry.question}`
          );
          
          console.log("Contenu de la base de connaissances inclus:", kbResults.length, "entrées");
        }
        
        // 2. Recherche dans les documents
        const docResults = await searchLocalDocuments(query);
        
        if (docResults.length > 0) {
          // Format structuré pour le contexte des documents
          const docContext = docResults
            .map((doc, index) => 
              `[Document ${index + 1}: ${doc.title || 'Sans titre'}]\n${doc.content.substring(0, 1000)}${doc.content.length > 1000 ? '...' : ''}`)
            .join('\n\n');
          
          context += "Information de nos documents :\n\n" + docContext + "\n\n";
          
          // Ajouter les sources de documents
          const docSources = docResults.map(doc => 
            `Document: ${doc.title || 'Sans titre'} (Score: ${doc.score?.toFixed(2) || 'N/A'})`
          );
          
          usedSources = [...usedSources, ...docSources];
          
          console.log("Contenu des documents inclus:", docResults.length, "documents");
        }
      }
      
      // Instructions plus précises pour Gemini
      const promptPrefix = includeLocalContent && context 
        ? "Analyse soigneusement les informations fournies de notre base de connaissances ET de nos documents locaux, puis utilise-les pour répondre à la question suivante. " +
          "Si les informations sont pertinentes, base ta réponse dessus en priorité. Sinon, utilise tes connaissances générales.\n\n" +
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

  const handleDocumentSearch = async () => {
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
    
    try {
      // Recherche dans les documents
      const searchResults = await searchLocalDocuments(query);
      
      if (searchResults.length > 0) {
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
        
        const result = await sendMessageToGemini(prompt, [], true, context);
        setResponse(result);
        setSources([...usedSources]);
      } else {
        // Si aucun résultat, message plus clair
        setResponse("Aucun document pertinent n'a été trouvé dans notre base documentaire pour répondre à cette question.");
        setSources(["Aucun document pertinent trouvé"]);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche documentaire:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche documentaire. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSemanticSearch = async () => {
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
    
    try {
      // Recherche sémantique dans les documents avec embeddings
      const searchResults = await searchLocalDocuments(query);
      
      if (searchResults.length > 0) {
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
        
        const result = await sendMessageToGemini(prompt, [], true, context);
        setResponse(result);
        setSources([...usedSources]);
      } else {
        // Message spécifique pour l'absence de résultats sémantiques
        setResponse("Aucun document sémantiquement similaire n'a été trouvé dans notre base documentaire. Cela peut être dû à l'absence de documents avec des embeddings vectoriels ou à une faible similarité avec votre requête.");
        setSources(["Aucun document sémantiquement similaire trouvé"]);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche sémantique:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche sémantique. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const updateExistingDocumentEmbeddings = async () => {
    setIsUpdatingEmbeddings(true);
    
    try {
      const result = await updateDocumentEmbeddings();
      
      if (result.success) {
        toast({
          title: "Mise à jour des embeddings",
          description: `${result.count} document(s) ont été mis à jour avec des embeddings vectoriels.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour des embeddings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des embeddings:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingEmbeddings(false);
    }
  };

  const handleSearch = () => {
    if (activeTab === "internet") {
      handleInternetSearch();
    } else if (activeTab === "local") {
      handleLocalSearch();
    } else if (activeTab === "documents") {
      handleDocumentSearch();
    } else if (activeTab === "semantic") {
      handleSemanticSearch();
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
    handleSearch,
    isUpdatingEmbeddings,
    updateExistingDocumentEmbeddings
  };
};
