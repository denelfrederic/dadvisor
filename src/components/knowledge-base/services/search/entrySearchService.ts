
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeEntry } from "../../types";
import { generateEntryEmbedding } from "../embedding/embeddingService";
import { prepareEmbeddingForStorage } from "../embedding/embeddingUtils";
import { searchEntriesBySimilarity } from "./embeddingSearchUtils";

/**
 * Searches knowledge entries using text search via embeddings
 */
export const searchEntries = async (query: string, topK: number = 5): Promise<KnowledgeEntry[]> => {
  try {
    // Generate embedding for the search query
    const queryEmbedding = await generateEntryEmbedding(query);
    
    if (!queryEmbedding) {
      console.error("Could not generate query embedding");
      return [];
    }
    
    // Use the similarity search function
    return await searchEntriesBySimilarity(queryEmbedding, 0.7, topK);
  } catch (error: any) {
    console.error("Error searching entries:", error);
    throw new Error(error.message);
  }
};

/**
 * Fetches all knowledge entries
 */
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
