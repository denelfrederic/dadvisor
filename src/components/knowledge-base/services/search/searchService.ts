import { supabase } from "@/integrations/supabase/client";
import { KnowledgeEntry } from "../../types";
import { generateEmbedding } from "./embeddingService";

export const searchEntries = async (query: string, topK: number = 5): Promise<KnowledgeEntry[]> => {
  try {
    // Generate embedding for the search query
    const queryEmbedding = await generateEmbedding(query);
    const queryEmbeddingString = JSON.stringify(queryEmbedding);

    // Perform a similarity search
    const { data, error } = await supabase.rpc('match_knowledge_base', {
      query_embedding: queryEmbeddingString,
      match_threshold: 0.7,
      match_count: topK,
    });

    if (error) {
      console.error("Error during similarity search:", error);
      throw new Error(error.message);
    }

    // Fetch the corresponding entries from the knowledge_base table
    if (data && data.length > 0) {
      const ids = data.map((item: any) => item.id);
      const { data: entries, error: fetchError } = await supabase
        .from('knowledge_base')
        .select('*')
        .in('id', ids);

      if (fetchError) {
        console.error("Error fetching entries:", fetchError);
        throw new Error(fetchError.message);
      }

      return entries || [];
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
      // Generate new embedding
      const embedding = await generateEmbedding(entry.content);
      const embeddingString = JSON.stringify(embedding);
      
      // Update the entry in the database
      const { error } = await supabase
        .from('knowledge_base')
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
      .from('knowledge_base')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error: any) {
    console.error("Error fetching all entries:", error);
    throw new Error(error.message);
  }
};
