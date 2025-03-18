
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useKnowledgeBaseService } from "../../services";
import { sendMessageToGemini } from "../../../chat/services";

export const useLocalSearch = () => {
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
    setDebugLogs([]); // Reset logs for new search
    
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
      // Utilisation d'une recherche plus flexible et contextuelle
      addLog(`Recherche dans la base de connaissances pour: "${query}"`);
      
      // Amélioration de la recherche pour plus de flexibilité
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
      addLog(`Termes de recherche: ${searchTerms.join(', ')}`);
      
      // Récupérer toutes les entrées et filtrer côté client pour plus de flexibilité
      const allEntries = await kb.getEntries();
      addLog(`Nombre total d'entrées récupérées: ${allEntries.length}`);
      
      if (allEntries.length === 0) {
        addLog("ALERTE: Aucune entrée trouvée dans la base de connaissances");
        setResponse("Aucune entrée n'a été trouvée dans la base de connaissances. Veuillez ajouter des questions/réponses avant d'effectuer une recherche.");
        setSources(["Base de connaissances vide"]);
        setIsSearching(false);
        return;
      }
      
      // Algorithme de correspondance amélioré avec plus de logging
      const matchScores: {entry: any, score: number}[] = [];
      
      for (const entry of allEntries) {
        const questionLower = entry.question.toLowerCase();
        const answerLower = entry.answer.toLowerCase();
        
        // Vérifier la correspondance exacte d'abord
        if (questionLower.includes(query.toLowerCase())) {
          matchScores.push({entry, score: 100});
          continue;
        }
        
        // Puis vérifier les correspondances partielles
        let matchScore = 0;
        for (const term of searchTerms) {
          if (questionLower.includes(term)) matchScore += 2;
          if (answerLower.includes(term)) matchScore += 1;
        }
        
        // Critère de correspondance minimum
        if (matchScore >= Math.min(2, searchTerms.length)) {
          matchScores.push({entry, score: matchScore});
        }
      }
      
      // Trier les correspondances par score descendant
      matchScores.sort((a, b) => b.score - a.score);
      
      const matchedEntries = matchScores.map(item => item.entry);
      
      addLog(`Entrées correspondantes trouvées: ${matchedEntries.length}`);
      
      if (matchedEntries.length > 0) {
        // Log des meilleurs résultats pour debug
        matchedEntries.slice(0, 3).forEach((entry, idx) => {
          addLog(`Top résultat #${idx + 1}: "${entry.question}" (score: ${matchScores[idx].score})`);
        });
        
        // Formatage amélioré du contexte pour Gemini
        const context = "Voici les informations pertinentes de notre base de connaissances :\n\n" +
          matchedEntries
            .slice(0, 5) // Limiter à 5 résultats pour éviter de surcharger le contexte
            .map((entry, index) => 
              `[Source ${index + 1}]\nQuestion: ${entry.question}\nRéponse: ${entry.answer}`)
            .join('\n\n');
        
        const usedSources = matchedEntries.slice(0, 5).map(entry => 
          `Base de connaissances: ${entry.question}`
        );
        
        addLog("Envoi de la requête à Gemini avec contexte");
        
        // Instructions plus précises pour Gemini
        const prompt = 
          "Tu es un assistant spécialisé dans la finance. Tu dois répondre à la question suivante en utilisant UNIQUEMENT les informations fournies de notre base de connaissances. " +
          "Si les informations ne contiennent pas d'éléments pertinents pour répondre, indique clairement: 'Je ne trouve pas d'information spécifique sur ce sujet dans notre base de connaissances.'\n\n" +
          "Question: " + query;
        
        const result = await sendMessageToGemini(prompt, [], true, context);
        addLog("Réponse reçue de Gemini");
        
        setResponse(result);
        setSources([...usedSources]);
      } else {
        addLog("Aucune correspondance trouvée dans la base de connaissances");
        
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
      addLog(`ERREUR: ${error instanceof Error ? error.message : String(error)}`);
      
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche. Veuillez réessayer.",
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
    handleSearch,
    debugLogs
  };
};
