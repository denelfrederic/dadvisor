
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeEntry } from "../../../types";
import { generateEntryEmbedding } from "../embeddingService";
import { prepareEmbeddingForStorage, processEntryForEmbedding } from "../embeddingUtils";

/**
 * Updates embeddings for a batch of knowledge entries
 */
export const updateEntryEmbeddingBatch = async (
  entries: KnowledgeEntry[],
  progressCallback?: (progress: number) => void
): Promise<{succeeded: number, total: number}> => {
  const totalEntries = entries.length;
  let processedEntries = 0;
  let successCount = 0;
  
  try {
    for (const entry of entries) {
      try {
        // Generate new embedding from combined question and answer
        const combinedText = processEntryForEmbedding(entry.question, entry.answer);
        const embedding = await generateEntryEmbedding(combinedText);
        
        if (!embedding) {
          console.error(`Failed to generate embedding for entry ${entry.id}`);
          continue;
        }
        
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
          console.error(`Erreur lors de la mise à jour de l'entrée ${entry.id}:`, error);
          continue;
        }
        
        successCount++;
      } catch (entryError) {
        console.error(`Erreur lors de la mise à jour de l'entrée ${entry.id}:`, entryError);
      } finally {
        // Update progress regardless of success or failure
        processedEntries++;
        if (progressCallback) {
          progressCallback((processedEntries / totalEntries) * 100);
        }
      }
    }
    
    console.log(`${successCount}/${totalEntries} entrées mises à jour avec succès.`);
    return {succeeded: successCount, total: totalEntries};
  } catch (error) {
    console.error('Error updating entry embeddings in batch:', error);
    throw error;
  }
};

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
  error?: string 
}> => {
  try {
    const log = (message: string) => {
      console.log(message);
      if (logCallback) logCallback(message);
    };

    log("Fetching knowledge entries without embeddings...");
    
    // Get entries that don't have embeddings - using only IS NULL condition to avoid syntax errors
    const { data: entries, error } = await supabase
      .from('knowledge_entries')
      .select('*')
      .is('embedding', null);  // Use only IS NULL to avoid type issues

    if (error) {
      log(`Error fetching entries: ${error.message}`);
      return { success: false, processed: 0, succeeded: 0, error: error.message };
    }

    if (!entries || entries.length === 0) {
      log("No entries found without embeddings");
      return { success: true, processed: 0, succeeded: 0 };
    }

    log(`Found ${entries.length} entries without embeddings. Starting update...`);
    
    // Update the entries in batches
    const result = await updateEntryEmbeddingBatch(entries, progressCallback);
    
    log(`Finished updating ${entries.length} entries`);
    
    return { 
      success: true, 
      processed: entries.length,
      succeeded: result.succeeded
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
