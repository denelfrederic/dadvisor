
/**
 * Parse embedding from string or JSON to array
 */
export const parseEmbedding = (embedding: any): number[] | null => {
  if (!embedding) return null;
  
  try {
    // Si c'est déjà un tableau, on le retourne directement
    if (Array.isArray(embedding)) {
      return embedding.length > 0 ? embedding : null;
    }
    
    // Si c'est une chaîne JSON, on la parse
    if (typeof embedding === 'string') {
      // Ignorer les chaînes vides
      if (embedding.trim() === '') return null;
      
      const parsed = JSON.parse(embedding);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors du parsing de l'embedding:", error);
    return null;
  }
};

/**
 * Prepare embedding array for storage in the database
 */
export const prepareEmbeddingForStorage = (embedding: number[]): string => {
  return JSON.stringify(embedding);
};

/**
 * Vérifie si un embedding est valide
 * Un embedding valide est un tableau non vide de nombres
 */
export const isValidEmbedding = (embedding: any): boolean => {
  try {
    // Si l'embedding est null ou undefined
    if (embedding === null || embedding === undefined) return false;
    
    // Si l'embedding est déjà un tableau
    if (Array.isArray(embedding)) {
      return embedding.length > 0 && 
             embedding.every(val => typeof val === 'number' && !isNaN(val));
    }
    
    // Si l'embedding est une chaîne
    if (typeof embedding === 'string') {
      // Ignorer les chaînes vides
      if (embedding.trim() === '') return false;
      
      try {
        const parsed = JSON.parse(embedding);
        return Array.isArray(parsed) && 
               parsed.length > 0 && 
               parsed.every(val => typeof val === 'number' && !isNaN(val));
      } catch (e) {
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'embedding:", error);
    return false;
  }
};
