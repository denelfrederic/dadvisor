
/**
 * Helper function to parse embedding string to number array
 * This is needed because Supabase stores embeddings as strings but we need them as arrays in JS
 */
export const parseEmbedding = (embedding: string | number[] | null): number[] | null => {
  if (!embedding) return null;
  if (Array.isArray(embedding)) return embedding;
  try {
    return JSON.parse(embedding as string);
  } catch (error) {
    console.error("Error parsing embedding:", error);
    return null;
  }
};

/**
 * Safely convert a number[] embedding to a format suitable for database storage
 */
export const prepareEmbeddingForStorage = (embedding: number[] | null): string | null => {
  if (!embedding) return null;
  return JSON.stringify(embedding);
};
