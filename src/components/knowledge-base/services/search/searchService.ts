
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeEntry } from "../../types";
import { generateEntryEmbedding } from "../embedding/embeddingService";
import { parseEmbedding, prepareEmbeddingForStorage } from "../embedding/embeddingUtils";

export const searchEntries = async (query: string, topK: number = 5): Promise<KnowledgeEntry[]> => {
  try {
    // Generate embedding for the search query
    const queryEmbedding = await generateEntryEmbedding(query);
    const queryEmbeddingString = prepareEmbeddingForStorage(queryEmbedding);

    // Perform a similarity search with RPC function
    const { data, error } = await supabase.rpc('match_knowledge_entries', {
      query_embedding: queryEmbeddingString,
      similarity_threshold: 0.7, // Changed from match_threshold to similarity_threshold
      match_count: topK,
    });

    if (error) {
      console.error("Error during similarity search:", error);
      throw new Error(error.message);
    }

    // Fetch the corresponding entries from the knowledge_entries table
    if (data && Array.isArray(data) && data.length > 0) {
      const ids = data.map((item: any) => item.id);
      const { data: entries, error: fetchError } = await supabase
        .from('knowledge_entries')
        .select('*')
        .in('id', ids);

      if (fetchError) {
        console.error("Error fetching entries:", fetchError);
        throw new Error(fetchError.message);
      }

      return entries as KnowledgeEntry[] || [];
    } else {
      return [];
    }
  } catch (error: any) {
    console.error("Error searching entries:", error);
    throw new Error(error.message);
  }
};

export const updateEntryEmbeddingBatch = async (
  entries: KnowledgeEntry[],
  progressCallback?: (progress: number) => void
): Promise<void> => {
  const totalEntries = entries.length;
  let processedEntries = 0;
  
  try {
    for (const entry of entries) {
      // Generate new embedding from combined question and answer
      const combinedText = `${entry.question}\n${entry.answer}`;
      const embedding = await generateEntryEmbedding(combinedText);
      const embeddingString = prepareEmbeddingForStorage(embedding);
      
      // Update the entry in the database
      const { error } = await supabase
        .from('knowledge_entries')
        .update({ 
          embedding: embeddingString,
          updated_at: new Date().toISOString()
        })
        .eq('id', entry.id);
      
      if (error) throw error;
      
      // Update progress
      processedEntries++;
      if (progressCallback) {
        progressCallback((processedEntries / totalEntries) * 100);
      }
    }
  } catch (error) {
    console.error('Error updating entry embeddings in batch:', error);
    throw error;
  }
};

export const getAllEntries = async (): Promise<KnowledgeEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('knowledge_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data as KnowledgeEntry[] || [];
  } catch (error: any) {
    console.error("Error fetching all entries:", error);
    throw new Error(error.message);
  }
};

// Add hook for compatibility with the knowledge base service
export const useSearchService = () => {
  return {
    searchEntries,
    getEntries: getAllEntries,
    searchEntriesBySimilarity: async (queryEmbedding: number[], threshold = 0.7, limit = 5) => {
      try {
        const queryEmbeddingString = prepareEmbeddingForStorage(queryEmbedding);
        const { data, error } = await supabase.rpc('match_knowledge_entries', {
          query_embedding: queryEmbeddingString,
          similarity_threshold: threshold, // Changed from match_threshold to similarity_threshold
          match_count: limit,
        });

        if (error) throw error;

        if (data && Array.isArray(data) && data.length > 0) {
          const ids = data.map((item: any) => item.id);
          const { data: entries, error: fetchError } = await supabase
            .from('knowledge_entries')
            .select('*')
            .in('id', ids);

          if (fetchError) throw fetchError;
          return entries as KnowledgeEntry[] || [];
        }
        return [];
      } catch (error) {
        console.error('Error in searchEntriesBySimilarity:', error);
        return [];
      }
    }
  };
};
