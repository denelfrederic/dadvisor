
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendMessageToGemini } from "@/components/chat/services/geminiService";

export interface CombinedSearchResult {
  response: string;
  isSearching: boolean;
}

/**
 * Hook simplifié qui interroge directement OpenAI
 */
export const useCombinedSearch = () => {
  const [response, setResponse] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  /**
   * Effectue une recherche directe via OpenAI GPT-4o
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

    try {
      console.log("Envoi direct à OpenAI GPT-4o pour:", query);
      
      // Instructions pour OpenAI
      const prompt = 
        "Tu es l'assistant IA de DADVISOR, spécialisé dans la finance et l'investissement. " +
        "Donne une réponse complète et pertinente en utilisant tes connaissances générales. " +
        "IMPORTANT: Réponds de manière pédagogique, concise mais complète, et adapte le niveau technique à un investisseur amateur. " +
        "Question de l'utilisateur DADVISOR: " + query;
      
      const result = await sendMessageToGemini(prompt, [], false);
      
      console.log(`Réponse reçue de OpenAI GPT-4o (${result.length} caractères)`);
      
      setResponse(result);
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
  }, [toast]);

  // Nettoyer les résultats
  const resetSearch = useCallback(() => {
    setResponse("");
  }, []);

  return {
    response,
    isSearching,
    handleSearch,
    resetSearch
  };
};
