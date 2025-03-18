
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendMessageToGemini } from "../../../chat/services";
import { searchLocalDocuments } from "../../../chat/services/documentService";

export const useSemanticSearch = () => {
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

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

  return {
    response,
    sources,
    isSearching,
    handleSearch
  };
};
