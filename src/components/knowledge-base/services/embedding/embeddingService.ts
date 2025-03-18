
import { supabase } from "@/integrations/supabase/client";
import { prepareEmbeddingForStorage } from "./embeddingUtils";

/**
 * Generate embedding for a knowledge base entry with consistent dimensions
 */
export const generateEntryEmbedding = async (text: string): Promise<number[] | null> => {
  try {
    const combinedText = text.trim();
    if (!combinedText) return null;
    
    console.log(`Generating knowledge entry embedding for text of length: ${combinedText.length}`);

    // Appel à notre fonction edge pour générer l'embedding
    const { data, error } = await supabase.functions.invoke("generate-embeddings", {
      body: { 
        text: combinedText,
        modelType: "knowledge-entry" // Spécifie que c'est pour une entrée de connaissance
      }
    });
    
    if (error) {
      console.error("Error generating embedding:", error);
      return null;
    }
    
    console.log(`Knowledge entry embedding generated successfully: ${data.dimensions} dimensions`);
    return data.embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
};

/**
 * Process text from knowledge entry to create combined text for embedding
 */
export const processEntryForEmbedding = (question: string, answer: string): string => {
  return `${question}\n${answer}`.trim();
};

/**
 * Check if embedding dimensions match expected dimensions for knowledge entries
 */
export const validateEmbeddingDimensions = (embedding: number[], expectedDimension = 384): boolean => {
  return embedding && Array.isArray(embedding) && embedding.length === expectedDimension;
};
