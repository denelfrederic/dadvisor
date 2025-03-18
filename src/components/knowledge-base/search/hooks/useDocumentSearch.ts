
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendMessageToGemini } from "../../../chat/services";
import { searchLocalDocuments } from "../../../chat/services/documentService";

export const useDocumentSearch = () => {
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

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

  return {
    response,
    sources,
    isSearching,
    handleSearch
  };
};
