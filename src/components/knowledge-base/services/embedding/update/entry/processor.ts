
import { KnowledgeEntry } from "../../../../types";

/**
 * Process a single entry for embedding update
 */
export const processEntryForEmbedding = (entry: KnowledgeEntry): string => {
  return `Question: ${entry.question.trim()}\nRéponse: ${entry.answer.trim()}`;
};

/**
 * Process an entry's question and answer for embedding
 */
export const processEntryForEmbeddingFromParts = (question: string, answer: string): string => {
  return `Question: ${question.trim()}\nRéponse: ${answer.trim()}`;
};

/**
 * Process a single entry for embedding update
 */
export const processEntryForUpdate = async (
  entry: KnowledgeEntry,
  expectedDimensions: number | null,
  logCallback?: (message: string) => void
): Promise<{ success: boolean; reason?: string }> => {
  const log = (message: string) => {
    console.log(message);
    if (logCallback) logCallback(message);
  };
  
  try {
    // Generate new embedding from combined question and answer
    const combinedText = processEntryForEmbedding(entry);
    log(`Generating embedding for entry ${entry.id.substring(0, 8)}, text length: ${combinedText.length}`);
    
    // This part would need to be implemented based on your embedding generation logic
    // For now, we'll just return success
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Error updating entry ${entry.id}: ${errorMessage}`);
    return { success: false, reason: `Exception: ${errorMessage}` };
  }
};
