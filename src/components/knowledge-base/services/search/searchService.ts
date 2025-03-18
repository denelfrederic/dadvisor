
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeEntry } from "../../types";
import { parseEmbedding, prepareEmbeddingForStorage } from "../embedding/embeddingUtils";

/**
 * Service for search and retrieval operations on knowledge entries
 */
export const useSearchService = () => {
  /**
   * Get all entries from the knowledge base
   */
  const getEntries = async (): Promise<KnowledgeEntry[]> => {
    try {
      console.log("Fetching all knowledge entries");
      
      const { data, error } = await supabase
        .from('knowledge_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching knowledge entries:", error);
        return [];
      }
      
      // Parse embeddings if present
      return data.map(entry => ({
        ...entry,
        embedding: parseEmbedding(entry.embedding)
      })) as KnowledgeEntry[];
    } catch (error) {
      console.error("Exception while fetching knowledge entries:", error);
      return [];
    }
  };

  /**
   * Search entries by text query
   */
  const searchEntries = async (query: string): Promise<KnowledgeEntry[]> => {
    try {
      console.log("Searching knowledge entries for:", query);
      
      // Create a SQL query to search in both question and answer
      const { data, error } = await supabase
        .from('knowledge_entries')
        .select('*')
        .or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error searching knowledge entries:", error);
        return [];
      }
      
      // Parse embeddings if present
      return data.map(entry => ({
        ...entry,
        embedding: parseEmbedding(entry.embedding)
      })) as KnowledgeEntry[];
    } catch (error) {
      console.error("Exception while searching knowledge entries:", error);
      return [];
    }
  };

  /**
   * Search entries by vector similarity
   */
  const searchEntriesBySimilarity = async (
    queryEmbedding: number[],
    threshold: number = 0.7,
    limit: number = 5
  ): Promise<KnowledgeEntry[]> => {
    try {
      console.log("Searching knowledge entries by embedding similarity");
      
      // Store the query embedding as a string for PostgreSQL vector comparison
      const embeddingString = prepareEmbeddingForStorage(queryEmbedding);
      
      // Use RPC function to perform similarity search
      const { data, error } = await supabase.rpc('match_knowledge_entries', {
        query_embedding: queryEmbedding,
        similarity_threshold: threshold,
        match_count: limit
      });
      
      if (error) {
        console.error("Error searching knowledge entries by similarity:", error);
        return [];
      }
      
      if (!data || data.length === 0) {
        console.log("No similar knowledge entries found");
        return [];
      }
      
      console.log(`Found ${data.length} similar knowledge entries`);
      
      // Parse embeddings if present and format results
      return data.map(entry => ({
        ...entry,
        embedding: parseEmbedding(entry.embedding)
      })) as KnowledgeEntry[];
    } catch (error) {
      console.error("Exception while searching knowledge entries by similarity:", error);
      return [];
    }
  };

  return {
    getEntries,
    searchEntries,
    searchEntriesBySimilarity
  };
};
