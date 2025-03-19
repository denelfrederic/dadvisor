
import { KnowledgeEntry } from "@/components/knowledge-base/types";
import { generateEntryEmbedding } from "@/components/knowledge-base/services/embedding/embeddingService";
import { isValidEmbedding, prepareEmbeddingForStorage } from "@/components/knowledge-base/services/embedding/embeddingUtils";
import { supabase } from "@/integrations/supabase/client";
import { processEntryForEmbedding } from "./processor";
import { isValidEntry } from "./validation";

/**
 * Process a batch of knowledge entries for embedding generation
 */
export const processBatchEmbeddings = async (
  entries: KnowledgeEntry[],
  batchSize: number = 5,
  onProgress?: (message: string) => void
): Promise<{ succeeded: number; failures: number }> => {
  let succeeded = 0;
  let failures = 0;
  
  // Filter valid entries
  const validEntries = entries.filter(entry => isValidEntry(entry));
  onProgress?.(`${validEntries.length} entrées valides sur ${entries.length} à traiter`);
  
  // Process in batches
  for (let i = 0; i < validEntries.length; i += batchSize) {
    const batch = validEntries.slice(i, i + batchSize);
    onProgress?.(`Traitement du lot ${i/batchSize + 1}/${Math.ceil(validEntries.length/batchSize)}...`);
    
    // Process each entry in the batch
    const batchPromises = batch.map(async (entry) => {
      try {
        // Prepare content
        const processedContent = processEntryForEmbedding(entry);
        
        // Generate embedding
        const embedding = await generateEntryEmbedding(processedContent);
        
        if (!embedding || !isValidEmbedding(embedding)) {
          onProgress?.(`Échec de génération d'embedding pour "${entry.question}"`);
          return { success: false, entry };
        }
        
        // Update entry with embedding
        // Here is the fix - convert the embedding to a string before storing
        const embeddingForStorage = prepareEmbeddingForStorage(embedding);
        
        const { error } = await supabase
          .from('knowledge_entries')
          .update({ embedding: embeddingForStorage })
          .eq('id', entry.id);
        
        if (error) {
          onProgress?.(`Erreur de mise à jour pour "${entry.question}": ${error.message}`);
          return { success: false, entry };
        }
        
        onProgress?.(`Embedding généré avec succès pour "${entry.question}"`);
        return { success: true, entry };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        onProgress?.(`Exception pour "${entry.question}": ${message}`);
        return { success: false, entry, error };
      }
    });
    
    // Wait for all entries in this batch to complete
    const results = await Promise.all(batchPromises);
    
    // Tally results
    succeeded += results.filter(r => r.success).length;
    failures += results.filter(r => !r.success).length;
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < validEntries.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  onProgress?.(`Traitement terminé. Réussis: ${succeeded}, Échecs: ${failures}`);
  return { succeeded, failures };
};

/**
 * Update embeddings for a batch of entries
 */
export const updateEntryEmbeddingBatch = processBatchEmbeddings;
