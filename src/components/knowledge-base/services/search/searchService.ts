
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
    
    // Ajouter un hook de détection de timeout
    const TIMEOUT = 10000; // 10 secondes
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    
    // Appel à notre fonction edge améliorée sans utiliser signal (pour compatibilité avec les types)
    const { data, error } = await supabase.functions.invoke("pinecone-vectorize", {
      body: { 
        action: "search-knowledge-base",
        query,
        threshold: 0.4, // Seuil plus bas pour plus de résultats
        limit,
        hybrid: true, // Activer la recherche hybride
        _cacheKey: Date.now() // Éviter la mise en cache
      }
    });
    
    // Annuler le timeout manuellement
    clearTimeout(timeoutId);
    
    if (controller.signal.aborted) {
      console.warn("La requête à l'edge function a expiré après 10 secondes");
      throw new Error("Timeout de la requête à l'edge function");
    }
    
    if (error) {
      console.error("Erreur lors de la recherche via Pinecone:", error);
      
      // Log détaillé pour diagnostic
      console.info("Erreur détaillée:", JSON.stringify(error));
      
      // En cas d'erreur de timeout, être plus explicite
      if (error.message && error.message.includes("abort")) {
        console.warn("La requête à l'edge function a expiré après 10 secondes");
        throw new Error("Timeout de la requête à l'edge function");
      }
      
      throw error;
    }
    
    if (!data || !data.success) {
      console.error("Échec de la recherche via Pinecone:", data?.error || "Réponse invalide");
      
      // Fallback vers la recherche standard
      console.info("Utilisation du fallback de recherche locale dans Supabase");
      return await searchEntries(query, limit);
    }
    
    console.log(`Résultats obtenus via Pinecone: ${data.results?.length || 0}`);
    
    // Sanity check sur les résultats
    if (!Array.isArray(data.results)) {
      console.warn("Résultats non-valides reçus de Pinecone, utilisation du fallback");
      return await searchEntries(query, limit);
    }
    
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
    searchEntriesWithPinecone
  };
};

// Export individual functions for direct use
export {
  searchEntries,
  getAllEntries,
  searchEntriesBySimilarity,
  updateEntryEmbeddingBatch
};
