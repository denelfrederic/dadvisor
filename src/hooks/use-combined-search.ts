
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendMessageToGemini } from "@/components/chat/services/geminiService";

export interface CombinedSearchResult {
  response: string;
  isSearching: boolean;
}

/**
 * Hook simplifié qui interroge directement l'API OpenAI via Edge Function
 */
export const useCombinedSearch = () => {
  const [response, setResponse] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  /**
   * Effectue une recherche directe via OpenAI GPT-4o avec les instructions DADVISOR
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
      console.log("Envoi à l'agent DADVISOR (Frédéric) pour:", query);
      
      // Simple envoi de la question utilisateur
      // Le prompt DADVISOR est maintenant géré dans l'Edge Function
      const result = await sendMessageToGemini(query, [], false);
      
      console.log(`Réponse reçue de l'agent DADVISOR (${result.length} caractères)`);
      
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
