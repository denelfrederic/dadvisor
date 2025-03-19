
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeEntry } from "../../../../types";
import { generateEntryEmbedding } from "../../embeddingService";
import { prepareEmbeddingForStorage, processEntryForEmbedding } from "../../embeddingUtils";
import { validateEmbeddingDimensions } from "./validation";

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
    const combinedText = processEntryForEmbedding(entry.question, entry.answer);
    log(`Generating embedding for entry ${entry.id.substring(0, 8)}, text length: ${combinedText.length}`);
    
    const embedding = await generateEntryEmbedding(combinedText);
    
    if (!embedding) {
      const reason = "Failed to generate embedding (null result)";
      log(`${reason} for entry ${entry.id}`);
      return { success: false, reason };
    }
    
    // Validate embedding before storing
    const validationResult = validateEmbeddingDimensions(embedding, expectedDimensions);
    
    if (!validationResult.valid) {
      const reason = validationResult.reason || "Unknown validation error";
      log(`${reason} for entry ${entry.id}`);
      return { success: false, reason };
    }
    
    log(`Generated embedding for entry ${entry.id.substring(0, 8)}, dimensions: ${embedding.length}`);
    const embeddingString = prepareEmbeddingForStorage(embedding);
    
    // Update the entry in the database
    const { error } = await supabase
      .from('knowledge_entries')
      .update({ 
        embedding: embeddingString,
        updated_at: new Date().toISOString()
      })
      .eq('id', entry.id);
    
    if (error) {
      const reason = `Database error: ${error.message}`;
      log(`${reason} for entry ${entry.id}`);
      return { success: false, reason };
    }
    
    log(`Successfully updated embedding for entry ${entry.id.substring(0, 8)}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Error updating entry ${entry.id}: ${errorMessage}`);
    return { success: false, reason: `Exception: ${errorMessage}` };
  }
};
