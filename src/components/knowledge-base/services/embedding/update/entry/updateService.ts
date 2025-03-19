
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
      onProgress?.(`Entrée invalide: ${entry.title}`);
      return false;
    }

    onProgress?.(`Traitement de l'entrée: ${entry.title}...`);
    
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
      onProgress?.(`Erreur de génération d'embedding pour ${entry.title}: ${embeddingError?.message || 'Réponse invalide'}`);
      return false;
    }

    // Update the entry with the new embedding
    const { error: updateError } = await supabase
      .from('knowledge_entries')
      .update({ embedding: embeddingData.embedding })
      .eq('id', entry.id);

    if (updateError) {
      onProgress?.(`Erreur de mise à jour pour ${entry.title}: ${updateError.message}`);
      return false;
    }

    onProgress?.(`Embedding mis à jour avec succès pour: ${entry.title}`);
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
