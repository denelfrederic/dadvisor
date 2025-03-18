
import { supabase } from "@/integrations/supabase/client";
import { DocumentSearchResult } from '../../types';
import { generateEmbedding } from "./embeddingService";
import { prepareEmbeddingForStorage } from "@/components/knowledge-base/services/embedding/embeddingUtils";

// Recherche de documents avec similarité vectorielle
export const searchLocalDocuments = async (query: string): Promise<DocumentSearchResult[]> => {
  try {
    // Essayer d'abord la recherche vectorielle si possible
    try {
      // Générer l'embedding pour la requête
      const queryEmbedding = await generateEmbedding(query);
      
      // Recherche vectorielle avec match_documents
      const { data: vectorResults, error: vectorError } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        similarity_threshold: 0.6, // Ajustable selon les besoins
        match_count: 5
      });
      
      if (!vectorError && vectorResults && vectorResults.length > 0) {
        console.log("Résultats de recherche vectorielle trouvés:", vectorResults.length);
        return vectorResults.map(item => ({
          id: item.id,
          title: item.title || "Sans titre",
          content: item.content,
          type: item.type,
          source: item.source,
          score: item.similarity,
          matchCount: 1 // Non applicable pour la recherche vectorielle
        }));
      }
    } catch (vectorSearchError) {
      console.warn("Recherche vectorielle échouée, repli sur la recherche textuelle:", vectorSearchError);
      // Continuer avec la recherche textuelle en cas d'échec
    }
    
    // Recherche textuelle classique (fallback)
    const { data: textResults, error: textError } = await supabase.rpc('search_documents', {
      search_query: query
    });
      
    if (textError) {
      console.error("Erreur lors de la recherche textuelle:", textError);
      return [];
    }
    
    return textResults || [];
  } catch (error) {
    console.error("Erreur lors de la recherche dans les documents:", error);
    return [];
  }
};
