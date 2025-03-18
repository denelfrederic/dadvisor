
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
 * Amélioré pour gérer tous les formats d'embedding possibles et éviter les faux négatifs
 */
export const isValidEmbedding = (embedding: any): boolean => {
  // Cas de base: null, undefined ou vide
  if (embedding === null || embedding === undefined) return false;
  
  // Si c'est déjà un tableau, vérifier qu'il contient des valeurs
  if (Array.isArray(embedding)) {
    return embedding.length > 0 && embedding.every(val => typeof val === 'number');
  }
  
  // Si c'est une chaîne JSON
  if (typeof embedding === 'string') {
    // Vérifier que la chaîne n'est pas vide
    if (!embedding.trim() || embedding.trim() === '{}' || embedding.trim() === '[]') {
      return false;
    }
    
    try {
      const parsed = JSON.parse(embedding);
      // Vérifier que c'est un tableau de nombres non vide
      return Array.isArray(parsed) && 
             parsed.length > 0 && 
             parsed.every(val => typeof val === 'number');
    } catch (e) {
      console.log(`String not parseable as JSON: "${embedding.substring(0, 20)}..."`);
      return false;
    }
  }
  
  return false;
};
