
import { KnowledgeEntry } from "../../types";
import { searchEntries, getAllEntries, searchEntriesBySimilarity } from "./entrySearchService";
import { updateEntryEmbeddingBatch } from "../embedding/embeddingUpdateService";
import { supabase } from "@/integrations/supabase/client";

/**
 * Recherche améliorée utilisant l'API Pinecone pour de meilleurs résultats de similarité
 */
export const searchEntriesWithPinecone = async (query: string, limit = 5): Promise<KnowledgeEntry[]> => {
  try {
    console.log(`Recherche avancée pour: "${query}" via Pinecone`);
    
    // Appel à notre fonction edge améliorée
    const { data, error } = await supabase.functions.invoke("pinecone-vectorize", {
      body: { 
        action: "search-knowledge-base",
        query,
        threshold: 0.4, // Seuil plus bas pour plus de résultats
        limit,
        hybrid: true // Activer la recherche hybride
      }
    });
    
    if (error) {
      console.error("Erreur lors de la recherche via Pinecone:", error);
      throw error;
    }
    
    if (!data.success) {
      console.error("Échec de la recherche via Pinecone:", data.error);
      return [];
    }
    
    console.log(`Résultats obtenus via Pinecone: ${data.results.length}`);
    return data.results;
  } catch (error) {
    console.error("Exception lors de la recherche avancée:", error);
    // Fallback vers la recherche standard en cas d'erreur
    return await searchEntries(query, limit);
  }
};

// Hook for compatibility with the knowledge base service
export const useSearchService = () => {
  return {
    searchEntries,
    getEntries: getAllEntries,
    searchEntriesBySimilarity,
    updateEntryEmbeddingBatch,
    searchEntriesWithPinecone // Nouvelle fonction
  };
};

// Export individual functions for direct use
export {
  searchEntries,
  getAllEntries,
  searchEntriesBySimilarity,
  updateEntryEmbeddingBatch,
  searchEntriesWithPinecone // Nouvelle fonction
};
