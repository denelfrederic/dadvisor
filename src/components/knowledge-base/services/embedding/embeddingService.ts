
import { supabase } from "@/integrations/supabase/client";
import { prepareEmbeddingForStorage, isValidEmbedding, processEntryForEmbedding } from "./embeddingUtils";

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
    
    if (!data || !data.embedding || !Array.isArray(data.embedding) || data.embedding.length === 0) {
      console.error("L'embedding généré est invalide ou vide:", data);
      return null;
    }
    
    // Vérifier explicitement que l'embedding est valide
    if (!isValidEmbedding(data.embedding)) {
      console.error("L'embedding généré n'est pas valide:", 
                    Array.isArray(data.embedding) ? data.embedding.slice(0, 5) : data.embedding);
      return null;
    }
    
    console.log(`Knowledge entry embedding generated successfully: ${data.embedding.length} dimensions, model: ${data.modelName || 'unknown'}`);
    return data.embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
};

/**
 * Check if embedding dimensions match expected dimensions for knowledge entries
 */
export const validateEmbeddingDimensions = (embedding: number[], expectedDimension = 384): boolean => {
  return embedding && Array.isArray(embedding) && embedding.length === expectedDimension;
};
