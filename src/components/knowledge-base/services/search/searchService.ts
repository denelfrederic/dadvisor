
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeEntry } from "../../types";
import { parseEmbedding } from "../embedding/embeddingUtils";

/**
 * Service for search and retrieval operations on knowledge entries
 */
export const useSearchService = () => {
  const { toast } = useToast();

  /**
   * Get all entries from the knowledge base
   */
  const getEntries = async (): Promise<KnowledgeEntry[]> => {
    try {
      console.log("Fetching all knowledge entries");
      
      const { data, error } = await supabase
        .from('knowledge_entries')
        .select('id, question, answer, source, created_at, updated_at, embedding')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching knowledge entries:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer la base de connaissances",
          variant: "destructive"
        });
        return [];
      }
      
      console.log("Fetched knowledge entries:", data.length);
      
      // Parse embeddings for all entries
      const entriesWithParsedEmbeddings = data.map(entry => ({
        ...entry,
        embedding: entry.embedding ? parseEmbedding(entry.embedding) : undefined
      }));
      
      return entriesWithParsedEmbeddings as KnowledgeEntry[];
    } catch (error) {
      console.error("Exception while fetching knowledge entries:", error);
      return [];
    }
  };

  /**
   * Search entries in the knowledge base
   */
  const searchEntries = async (query: string): Promise<KnowledgeEntry[]> => {
    try {
      console.log("Searching knowledge entries for:", query);
      
      if (!query.trim()) {
        return [];
      }
      
      // Using Supabase's full-text search
      const { data, error } = await supabase
        .from('knowledge_entries')
        .select('id, question, answer, source, created_at, updated_at, embedding')
        .or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error searching knowledge entries:", error);
        toast({
          title: "Erreur",
          description: "Impossible d'effectuer la recherche",
          variant: "destructive"
        });
        return [];
      }
      
      console.log("Search results:", data.length);
      
      // Parse embeddings for all entries
      const entriesWithParsedEmbeddings = data.map(entry => ({
        ...entry,
        embedding: entry.embedding ? parseEmbedding(entry.embedding) : undefined
      }));
      
      return entriesWithParsedEmbeddings as KnowledgeEntry[];
    } catch (error) {
      console.error("Exception while searching knowledge entries:", error);
      return [];
    }
  };

  /**
   * Search entries by semantic similarity using embeddings
   */
  const searchEntriesBySimilarity = async (
    queryEmbedding: number[], 
    threshold: number = 0.7, 
    limit: number = 5
  ): Promise<KnowledgeEntry[]> => {
    try {
      console.log("Searching knowledge entries by similarity");
      
      const { data, error } = await supabase.rpc(
        'match_knowledge_entries',
        {
          query_embedding: queryEmbedding,
          similarity_threshold: threshold,
          match_count: limit
        }
      );
      
      if (error) {
        console.error("Error in similarity search:", error);
        toast({
          title: "Erreur",
          description: "Impossible d'effectuer la recherche sémantique",
          variant: "destructive"
        });
        return [];
      }
      
      console.log("Semantic search results:", data?.length || 0);
      return data as KnowledgeEntry[];
    } catch (error) {
      console.error("Exception in similarity search:", error);
      return [];
    }
  };

  return {
    getEntries,
    searchEntries,
    searchEntriesBySimilarity
  };
};
