
import { isValidEmbedding } from "../../embeddingUtils";

/**
 * Validates embedding dimensions against database expectations
 */
export const validateEmbeddingDimensions = (
  embedding: number[], 
  expectedDimensions: number | null
): { valid: boolean; reason?: string } => {
  if (!embedding || !Array.isArray(embedding)) {
    return { 
      valid: false, 
      reason: "Generated embedding is not a valid array" 
    };
  }
  
  // During transition period, accept 384, 768, or 1536 dimensions
  if (expectedDimensions === null || expectedDimensions === 1536) {
    const isValidDimension = embedding.length === 384 || 
                             embedding.length === 768 || 
                             embedding.length === 1536;
    
    if (!isValidDimension) {
      return {
        valid: false,
        reason: `Dimension mismatch: generated ${embedding.length}, but expected 384, 768, or 1536`
      };
    }
    
    if (!isValidEmbedding(embedding)) {
      return {
        valid: false,
        reason: "Generated invalid embedding"
      };
    }
    
    return { valid: true };
  }
  
  // For specific dimension requirements
  if (embedding.length !== expectedDimensions) {
    return {
      valid: false,
      reason: `Dimension mismatch: generated ${embedding.length}, but database expects ${expectedDimensions}`
    };
  }
  
  return { valid: true };
};
