
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeEntry } from "../../types";
import { generateEntryEmbedding, validateEmbeddingDimensions } from "../embedding/embeddingService";
import { parseEmbedding } from "../embedding/embeddingUtils";

/**
 * Search for knowledge entries by semantic similarity using embeddings
 */
export const searchEntriesBySimilarity = async (
  queryEmbedding: number[],
  threshold = 0.5,
  limit = 5
): Promise<KnowledgeEntry[]> => {
  try {
    // Validate the input embedding dimensions
    if (!validateEmbeddingDimensions(queryEmbedding, 384)) {
      console.error(`Invalid query embedding dimensions: expected 384, got ${queryEmbedding.length}`);
      return [];
    }

    // Call the database function that performs the vector similarity search
    const { data, error } = await supabase.rpc('match_knowledge_entries', {
      query_embedding: queryEmbedding,
      similarity_threshold: threshold,
      match_count: limit
    });

    if (error) {
      console.error("Error in semantic knowledge search:", error);
      return [];
    }

    return data.map((entry: any) => ({
      ...entry,
      similarity: entry.similarity.toFixed(2)
    })) as KnowledgeEntry[];
  } catch (error) {
    console.error("Error in semantic knowledge search:", error);
    return [];
  }
};

/**
 * Search for knowledge entries matching a text query
 */
export const searchEntriesByText = async (query: string, limit = 5): Promise<KnowledgeEntry[]> => {
  try {
    // Format the query for text search
    const formattedQuery = query.trim().toLowerCase();
    
    if (!formattedQuery) {
      return [];
    }

    // Perform text search on question and answer fields
    const { data, error } = await supabase
      .from('knowledge_entries')
      .select('*')
      .or(`question.ilike.%${formattedQuery}%,answer.ilike.%${formattedQuery}%`)
      .limit(limit);

    if (error) {
      console.error("Error in text knowledge search:", error);
      return [];
    }

    return data as KnowledgeEntry[];
  } catch (error) {
    console.error("Error in text knowledge search:", error);
    return [];
  }
};

/**
 * Search for knowledge entries using semantic similarity with a text query
 */
export const searchEntriesSemanticByText = async (query: string, limit = 5): Promise<KnowledgeEntry[]> => {
  try {
    // Generate embedding for the query text
    const queryEmbedding = await generateEntryEmbedding(query);
    
    if (!queryEmbedding) {
      console.error("Failed to generate embedding for query");
      return [];
    }
    
    // Search by similarity using the generated embedding
    return await searchEntriesBySimilarity(queryEmbedding, 0.7, limit);
  } catch (error) {
    console.error("Error in semantic text search:", error);
    return [];
  }
};

/**
 * Convert embedding from database format to array format
 */
export const processEntryEmbeddings = (entries: KnowledgeEntry[]): KnowledgeEntry[] => {
  return entries.map(entry => ({
    ...entry,
    embedding: parseEmbedding(entry.embedding)
  }));
};
