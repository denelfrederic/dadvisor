
// Fonction pour déterminer si un embedding est valide
export const isValidEmbedding = (embedding: any): boolean => {
  try {
    // Convertir l'embedding en tableau si c'est une chaîne
    const embeddingArray = typeof embedding === 'string' 
      ? parseEmbedding(embedding)
      : embedding;
    
    // Vérifier si c'est un tableau non vide
    if (!Array.isArray(embeddingArray) || embeddingArray.length === 0) {
      console.log(`Embedding invalide: n'est pas un tableau non vide`);
      return false;
    }
    
    // Vérifier les dimensions - accepter 384 (ancien modèle) ou 1536 (nouveau modèle)
    // Notre base de données est maintenant configurée pour 1536 dimensions
    if (embeddingArray.length !== 384 && embeddingArray.length !== 768 && embeddingArray.length !== 1536) {
      console.log(`Embedding de dimensions non valides: ${embeddingArray.length}, attendu: 384, 768 ou 1536`);
      return false;
    }
    
    // Vérifier que tous les éléments sont des nombres
    const allNumbers = embeddingArray.every(val => typeof val === 'number' && !isNaN(val));
    if (!allNumbers) {
      console.log(`Embedding contient des valeurs non numériques`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'embedding:", error);
    return false;
  }
};

// Fonction pour analyser un embedding stocké sous forme de chaîne
export const parseEmbedding = (embeddingString: string): number[] => {
  try {
    if (!embeddingString) return [];
    
    // Si c'est déjà un tableau, le retourner
    if (Array.isArray(embeddingString)) {
      return embeddingString;
    }
    
    // Analyser la chaîne JSON
    const parsed = JSON.parse(embeddingString);
    
    // Vérifier si c'est un tableau valide après l'analyse
    if (!Array.isArray(parsed)) {
      console.error("L'embedding parsé n'est pas un tableau");
      return [];
    }
    
    return parsed;
  } catch (error) {
    console.error("Erreur lors de l'analyse de l'embedding:", error);
    return [];
  }
};

// Fonction pour préparer un embedding pour le stockage
export const prepareEmbeddingForStorage = (embedding: number[] | string): string => {
  if (typeof embedding === 'string') {
    // Vérifier si c'est déjà une chaîne JSON valide
    try {
      JSON.parse(embedding);
      return embedding;
    } catch {
      // Si ce n'est pas une chaîne JSON valide, essayer de l'encoder
      return JSON.stringify(embedding);
    }
  }
  
  // Si c'est un tableau, le convertir en chaîne JSON
  return JSON.stringify(embedding);
};

// Fonction pour préparer le texte d'une entrée pour l'embedding
export const processEntryForEmbedding = (question: string, answer: string): string => {
  return `Question: ${question.trim()}\nRéponse: ${answer.trim()}`;
};

// Fonction pour valider les dimensions d'un embedding
export const validateEmbeddingDimensions = (embedding: number[], expectedDimension = 1536): boolean => {
  if (!Array.isArray(embedding)) {
    console.log("L'embedding n'est pas un tableau");
    return false;
  }
  
  // Pour la période de transition, accepter 384, 768 ou 1536 dimensions
  if (expectedDimension === 1536) {
    const isValid = embedding.length === 384 || embedding.length === 768 || embedding.length === 1536;
    if (!isValid) {
      console.log(`Dimensions incorrectes: ${embedding.length}, attendu: 384, 768 ou 1536`);
    }
    return isValid;
  }
  
  // Pour la compatibilité avec l'ancien code
  const isValid = embedding.length === expectedDimension;
  if (!isValid) {
    console.log(`Dimensions incorrectes: ${embedding.length}, attendu: ${expectedDimension}`);
  }
  
  return isValid;
};
