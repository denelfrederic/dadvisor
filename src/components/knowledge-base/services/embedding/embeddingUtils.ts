
/**
 * Helper function to parse embedding string to number array
 * This is needed because Supabase stores embeddings as strings but we need them as arrays in JS
 */
export const parseEmbedding = (embedding: string | number[] | null): number[] | null => {
  if (!embedding) return null;
  if (Array.isArray(embedding)) return embedding;
  try {
    const parsed = JSON.parse(embedding as string);
    return Array.isArray(parsed) ? parsed : null;
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

/**
 * Process text from knowledge entry to create combined text for embedding
 */
export const processEntryForEmbedding = (question: string, answer: string): string => {
  return `${question}\n${answer}`.trim();
};

/**
 * Check if an embedding is valid (not null and properly formatted)
 * Improved version to handle all possible embedding formats
 */
export const isValidEmbedding = (embedding: any): boolean => {
  if (embedding === null || embedding === undefined) return false;
  
  try {
    // Si c'est déjà un tableau, vérifier qu'il contient des valeurs
    if (Array.isArray(embedding)) {
      return embedding.length > 0;
    }
    
    // Si c'est une chaîne, vérifier qu'elle contient un tableau valide
    if (typeof embedding === 'string') {
      // Si la chaîne est vide ou juste "{}" ou "[]", elle n'est pas valide
      if (embedding.trim() === '{}' || embedding.trim() === '[]' || embedding.trim() === '') {
        return false;
      }
      
      try {
        const parsed = JSON.parse(embedding);
        return Array.isArray(parsed) && parsed.length > 0;
      } catch (e) {
        // Si on ne peut pas parser la chaîne, elle n'est pas valide
        return false;
      }
    }
    
    return false;
  } catch (e) {
    console.error("Error validating embedding:", e);
    return false;
  }
};
