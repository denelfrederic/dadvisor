
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeEntry } from "../../types";
import { generateEntryEmbedding } from "../embedding/embeddingService";
import { prepareEmbeddingForStorage } from "../embedding/embeddingUtils";

/**
 * Updates embeddings for a batch of knowledge entries
 */
export const updateEntryEmbeddingBatch = async (
  entries: KnowledgeEntry[],
  progressCallback?: (progress: number) => void
): Promise<void> => {
  const totalEntries = entries.length;
  let processedEntries = 0;
  let successCount = 0;
  
  try {
    for (const entry of entries) {
      try {
        // Generate new embedding from combined question and answer
        const combinedText = `${entry.question}\n${entry.answer}`;
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
  } catch (error) {
    console.error('Error updating entry embeddings in batch:', error);
    throw error;
  }
};
