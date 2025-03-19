
import { KnowledgeEntry } from "../../../../types";
import { processEntryForUpdate } from "./processor";

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
      const result = await processEntryForUpdate(entry, expectedDimensions, logCallback);
      
      if (result.success) {
        successCount++;
      } else {
        failures.push({ id: entry.id, reason: result.reason || "Unknown error" });
      }
      
      // Update progress regardless of success or failure
      processedEntries++;
      if (progressCallback) {
        // Ensure progress is an integer percentage
        const percentProgress = Math.round((processedEntries / totalEntries) * 100);
        progressCallback(percentProgress);
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
