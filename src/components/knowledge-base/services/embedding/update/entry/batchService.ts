
import { generateEmbedding } from "../../../embeddingService";
import { isValidEmbedding, prepareEmbeddingForStorage } from "../../../embeddingUtils";
import { supabase } from "@/integrations/supabase/client";

/**
 * Mettre à jour l'embedding d'une entrée en mode batch
 */
export const updateEntryEmbeddingBatch = async (entryId: string, content: string): Promise<boolean> => {
  try {
    // Générer l'embedding pour le contenu
    const embedding = await generateEmbedding(content);
    
    if (!embedding || !isValidEmbedding(embedding)) {
      console.error(`Generated invalid embedding, dimensions: ${embedding ? embedding.length : 'null'} for entry ${entryId}`);
      return false;
    }
    
    // Préparer l'embedding pour le stockage
    const embeddingForStorage = prepareEmbeddingForStorage(embedding);
    
    // Mettre à jour l'entrée dans la base de données
    const { error } = await supabase
      .from('knowledge_entries')
      .update({ embedding: embeddingForStorage })
      .eq('id', entryId);
    
    if (error) {
      console.error(`Error updating embedding for entry ${entryId}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error in updateEntryEmbeddingBatch for entry ${entryId}:`, error);
    return false;
  }
};
