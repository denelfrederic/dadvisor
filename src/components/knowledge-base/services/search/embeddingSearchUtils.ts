
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeEntry } from "../../types";
import { prepareEmbeddingForStorage } from "../embedding/embeddingUtils";

/**
 * Performs a similarity search against knowledge entries using the vector embeddings
 */
export const searchEntriesBySimilarity = async (
  queryEmbedding: number[], 
  threshold = 0.7, 
  limit = 5
): Promise<KnowledgeEntry[]> => {
  try {
    const queryEmbeddingString = prepareEmbeddingForStorage(queryEmbedding);
    const { data, error } = await supabase.rpc('match_knowledge_entries', {
      query_embedding: queryEmbeddingString,
      similarity_threshold: threshold,
      match_count: limit,
    });

    if (error) {
      console.error("Error during similarity search:", error);
      throw error;
    }

    if (data && Array.isArray(data) && data.length > 0) {
      const ids = data.map((item: any) => item.id);
      const { data: entries, error: fetchError } = await supabase
        .from('knowledge_entries')
        .select('*')
        .in('id', ids);

      if (fetchError) {
        console.error("Error fetching entries:", fetchError);
        throw fetchError;
      }
      
      return entries as KnowledgeEntry[] || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error in searchEntriesBySimilarity:', error);
    return [];
  }
};
