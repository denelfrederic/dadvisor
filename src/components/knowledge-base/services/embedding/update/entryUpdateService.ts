
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeEntry } from "../../../types";
import { generateEntryEmbedding } from "../embeddingService";
import { prepareEmbeddingForStorage, processEntryForEmbedding, isValidEmbedding } from "../embeddingUtils";

/**
 * Updates embeddings for a batch of knowledge entries
 */
export const updateEntryEmbeddingBatch = async (
  entries: KnowledgeEntry[],
  progressCallback?: (progress: number) => void,
  logCallback?: (message: string) => void
): Promise<{succeeded: number, total: number, failures: {id: string, reason: string}[]}> => {
  const totalEntries = entries.length;
  let processedEntries = 0;
  let successCount = 0;
  const failures: {id: string, reason: string}[] = [];
  
  const log = (message: string) => {
    console.log(message);
    if (logCallback) logCallback(message);
  };
  
  try {
    // First, try to get the expected embedding dimensions from the database schema
    let expectedDimensions: number | null = null;
    try {
      // Use a custom SQL query to get the column type modifier
      const { data: schemaInfo, error: schemaError } = await supabase
        .rpc('get_column_type_modifier', { 
          table_name: 'knowledge_entries', 
          column_name: 'embedding' 
        });
      
      if (schemaError) {
        log(`Could not determine embedding column type: ${schemaError.message}`);
      } else if (schemaInfo) {
        expectedDimensions = parseInt(schemaInfo as string, 10);
        log(`Database expects embedding dimensions: ${expectedDimensions}`);
      }
    } catch (error) {
      log(`Could not determine expected embedding dimensions: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    for (const entry of entries) {
      try {
        // Generate new embedding from combined question and answer
        const combinedText = processEntryForEmbedding(entry.question, entry.answer);
        log(`Generating embedding for entry ${entry.id.substring(0, 8)}, text length: ${combinedText.length}`);
        
        const embedding = await generateEntryEmbedding(combinedText);
        
        if (!embedding) {
          const reason = "Failed to generate embedding (null result)";
          log(`${reason} for entry ${entry.id}`);
          failures.push({ id: entry.id, reason });
          continue;
        }
        
        // Validate embedding before storing - now accepting 384, 768, or 1536 dimensions
        if (!isValidEmbedding(embedding)) {
          const reason = `Generated invalid embedding, dimensions: ${embedding.length}`;
          log(`${reason} for entry ${entry.id}`);
          failures.push({ id: entry.id, reason });
          continue;
        }
        
        // Check if dimensions match what the database expects - during transition period, accept different dimensions
        if (expectedDimensions && embedding.length !== expectedDimensions && 
            !(embedding.length === 384 || embedding.length === 768 || embedding.length === 1536)) {
          const reason = `Dimension mismatch: generated ${embedding.length}, but database expects ${expectedDimensions}`;
          log(`${reason} for entry ${entry.id}`);
          failures.push({ id: entry.id, reason });
          continue;
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
          failures.push({ id: entry.id, reason });
          continue;
        }
        
        log(`Successfully updated embedding for entry ${entry.id.substring(0, 8)}`);
        successCount++;
      } catch (entryError) {
        const errorMessage = entryError instanceof Error ? entryError.message : String(entryError);
        log(`Error updating entry ${entry.id}: ${errorMessage}`);
        failures.push({ id: entry.id, reason: `Exception: ${errorMessage}` });
      } finally {
        // Update progress regardless of success or failure
        processedEntries++;
        if (progressCallback) {
          // Ensure progress is an integer percentage
          const percentProgress = Math.round((processedEntries / totalEntries) * 100);
          progressCallback(percentProgress);
        }
      }
    }
    
    log(`${successCount}/${totalEntries} entrées mises à jour avec succès.`);
    if (failures.length > 0) {
      log(`Échecs: ${failures.length} entrées ont échoué. Raisons principales:`);
      
      // Group failures by reason to see patterns
      const reasonCounts: Record<string, number> = {};
      failures.forEach(f => {
        reasonCounts[f.reason] = (reasonCounts[f.reason] || 0) + 1;
      });
      
      Object.entries(reasonCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([reason, count]) => {
          log(`- ${reason}: ${count} entrées`);
        });
    }
    
    return {succeeded: successCount, total: totalEntries, failures};
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
