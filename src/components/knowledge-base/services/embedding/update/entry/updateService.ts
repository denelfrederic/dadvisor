
import { supabase } from "@/integrations/supabase/client";
import { isValidEmbedding } from "../../embeddingUtils";
import { updateEntryEmbeddingBatch } from "./batchService";

/**
 * Updates embeddings for all knowledge entries
 * @param progressCallback Function to call with progress updates
 * @param logCallback Function to call with log messages
 * @returns Object with success status and counts of processed/succeeded entries
 */
export const updateKnowledgeEntries = async (
  progressCallback?: (progress: number) => void,
  logCallback?: (message: string) => void
): Promise<{ 
  success: boolean; 
  processed: number; 
  succeeded: number; 
  failures?: {id: string, reason: string}[];
  error?: string 
}> => {
  try {
    const log = (message: string) => {
      console.log(message);
      if (logCallback) logCallback(message);
    };

    log("Fetching knowledge entries without embeddings...");
    
    // Get entries that don't have embeddings or have invalid embeddings
    const { data: entries, error } = await supabase
      .from('knowledge_entries')
      .select('*');

    if (error) {
      log(`Error fetching entries: ${error.message}`);
      return { success: false, processed: 0, succeeded: 0, error: error.message };
    }

    if (!entries || entries.length === 0) {
      log("No entries found without embeddings");
      return { success: true, processed: 0, succeeded: 0 };
    }
    
    // Filter entries without valid embeddings
    const entriesToUpdate = entries.filter(entry => {
      if (!entry.embedding) return true;
      
      if (typeof entry.embedding === 'string') {
        try {
          const parsed = JSON.parse(entry.embedding);
          return !Array.isArray(parsed) || parsed.length !== 384;
        } catch {
          return true;
        }
      }
      
      return !isValidEmbedding(entry.embedding);
    });
    
    if (entriesToUpdate.length === 0) {
      log("All entries already have valid embeddings");
      return { success: true, processed: 0, succeeded: 0 };
    }

    log(`Found ${entriesToUpdate.length} entries without valid embeddings. Starting update...`);
    
    // Update the entries in batches
    const result = await updateEntryEmbeddingBatch(entriesToUpdate, progressCallback, logCallback);
    
    log(`Finished updating ${entriesToUpdate.length} entries, ${result.succeeded} succeeded`);
    
    return { 
      success: true, 
      processed: entriesToUpdate.length,
      succeeded: result.succeeded,
      failures: result.failures
    };
  } catch (error) {
    console.error("Error in updateKnowledgeEntries:", error);
    return { 
      success: false, 
      processed: 0, 
      succeeded: 0, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
};
