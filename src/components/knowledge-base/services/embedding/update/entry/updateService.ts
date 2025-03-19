
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { KnowledgeEntry } from "@/components/knowledge-base/types";
import { processEntryForEmbedding } from "./processor";
import { isValidEntry } from "./validation";

/**
 * Updates embedding for a single knowledge entry
 */
export const updateEntryEmbedding = async (
  entry: KnowledgeEntry,
  onProgress?: (message: string) => void
): Promise<boolean> => {
  try {
    if (!isValidEntry(entry)) {
      onProgress?.(`Entrée invalide: ${entry.question}`);
      return false;
    }

    onProgress?.(`Traitement de l'entrée: ${entry.question}...`);
    
    // Process the entry content for embedding
    const processedContent = processEntryForEmbedding(entry);
    
    // Generate embedding
    const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke(
      'generate-embeddings',
      {
        body: { text: processedContent }
      }
    );

    if (embeddingError || !embeddingData || !embeddingData.embedding) {
      onProgress?.(`Erreur de génération d'embedding pour ${entry.question}: ${embeddingError?.message || 'Réponse invalide'}`);
      return false;
    }

    // Update the entry with the new embedding
    const { error: updateError } = await supabase
      .from('knowledge_entries')
      .update({ embedding: embeddingData.embedding })
      .eq('id', entry.id);

    if (updateError) {
      onProgress?.(`Erreur de mise à jour pour ${entry.question}: ${updateError.message}`);
      return false;
    }

    onProgress?.(`Embedding mis à jour avec succès pour: ${entry.question}`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    onProgress?.(`Exception lors de la mise à jour: ${message}`);
    return false;
  }
};

/**
 * Updates embeddings for multiple knowledge entries
 */
export const updateEntriesEmbeddings = async (
  entries: KnowledgeEntry[],
  onProgress?: (message: string) => void
): Promise<{ succeeded: number; failures: number }> => {
  let succeeded = 0;
  let failures = 0;

  onProgress?.(`Démarrage de la mise à jour pour ${entries.length} entrées...`);

  for (const entry of entries) {
    const success = await updateEntryEmbedding(entry, onProgress);
    if (success) {
      succeeded++;
    } else {
      failures++;
    }
  }

  return { succeeded, failures };
};

/**
 * Fetches all entries and updates their embeddings
 */
export const updateKnowledgeEntries = async (
  onProgressPercent?: (percent: number) => void,
  onLog?: (message: string) => void
): Promise<{ 
  success: boolean; 
  succeeded?: number; 
  failures?: any[]; 
  processed?: number;
  error?: string;
}> => {
  try {
    onLog?.("Fetching entries from database...");
    
    // Fetch entries that need updating
    const { data: entries, error } = await supabase
      .from('knowledge_entries')
      .select('*');
      
    if (error) {
      onLog?.(`Error fetching entries: ${error.message}`);
      return { success: false, error: error.message };
    }
    
    if (!entries || entries.length === 0) {
      onLog?.("No entries found to update");
      return { success: true, succeeded: 0, failures: [], processed: 0 };
    }
    
    onLog?.(`Found ${entries.length} entries to process`);
    
    // Process entries
    let succeeded = 0;
    let failures: any[] = [];
    
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      onLog?.(`Processing entry ${i+1}/${entries.length}: ${entry.question}`);
      
      // Update progress percentage
      if (onProgressPercent) {
        const percent = Math.round(((i+1) / entries.length) * 100);
        onProgressPercent(percent);
      }
      
      // Process the entry
      const success = await updateEntryEmbedding(entry, onLog);
      
      if (success) {
        succeeded++;
      } else {
        failures.push({
          id: entry.id,
          question: entry.question,
          reason: "Failed to update embedding"
        });
      }
    }
    
    onLog?.(`Completed processing: ${succeeded} succeeded, ${failures.length} failed`);
    
    return {
      success: true,
      succeeded,
      failures,
      processed: entries.length
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    onLog?.(`Error in updateKnowledgeEntries: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
};
