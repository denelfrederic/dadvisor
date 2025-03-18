
import { generateEmbedding as generateDocEmbedding } from "@/components/chat/services/document/embeddingService";
import { prepareEmbeddingForStorage } from "./embeddingUtils";

/**
 * Generate embedding for a knowledge base entry
 */
export const generateEntryEmbedding = async (text: string): Promise<number[] | null> => {
  try {
    const combinedText = text.trim();
    if (!combinedText) return null;

    return await generateDocEmbedding(combinedText);
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
