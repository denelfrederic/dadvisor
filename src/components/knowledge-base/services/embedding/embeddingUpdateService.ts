
import { supabase } from "@/integrations/supabase/client";
import { updateDocumentEmbeddings } from "@/components/chat/services/document/documentProcessor";
import { generateEmbedding } from "@/components/chat/services/document/embeddingService";
import { prepareEmbeddingForStorage } from "./embeddingUtils";

/**
 * Updates document embeddings and returns the results
 */
export const updateDocuments = async (): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> => {
  try {
    const result = await updateDocumentEmbeddings();
    return result;
  } catch (error) {
    return { 
      success: false, 
      count: 0, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
};

/**
 * Updates knowledge entry embeddings
 */
export const updateKnowledgeEntries = async (
  onProgress?: (progress: number) => void,
  onLog?: (message: string) => void
): Promise<{
  success: boolean;
  processed: number;
  succeeded: number;
  error?: string;
}> => {
  try {
    // Récupérer les entrées sans embedding
    const { data: entriesWithoutEmbedding, error: fetchError } = await supabase
      .from('knowledge_entries')
      .select('id, question, answer')
      .is('embedding', null);
    
    if (fetchError) {
      throw new Error(`Erreur lors de la récupération des entrées: ${fetchError.message}`);
    }
    
    if (!entriesWithoutEmbedding || entriesWithoutEmbedding.length === 0) {
      onLog?.("Aucune entrée sans embedding trouvée.");
      onProgress?.(100);
      return { success: true, processed: 0, succeeded: 0 };
    }
    
    onLog?.(`${entriesWithoutEmbedding.length} entrées sans embedding trouvées, traitement...`);
    let successCount = 0;
    
    for (let i = 0; i < entriesWithoutEmbedding.length; i++) {
      const entry = entriesWithoutEmbedding[i];
      onProgress?.(Math.floor((i / entriesWithoutEmbedding.length) * 100));
      
      try {
        // Combiner question et réponse pour l'embedding
        const textToEmbed = `${entry.question}\n${entry.answer}`;
        
        // Générer l'embedding avec le type de modèle "knowledge-entry"
        const embedding = await generateEmbedding(textToEmbed, "knowledge-entry");
        
        if (!embedding) {
          onLog?.(`Échec de génération d'embedding pour l'entrée ${entry.id}`);
          continue;
        }
        
        // Préparer l'embedding pour le stockage
        const embeddingForStorage = prepareEmbeddingForStorage(embedding);
        
        // Mettre à jour l'entrée
        const { error: updateError } = await supabase
          .from('knowledge_entries')
          .update({ embedding: embeddingForStorage })
          .eq('id', entry.id);
        
        if (updateError) {
          onLog?.(`Erreur lors de la mise à jour de l'entrée ${entry.id}: ${updateError.message}`);
        } else {
          successCount++;
          onLog?.(`Entrée ${entry.id} mise à jour avec embedding.`);
        }
      } catch (entryError) {
        onLog?.(`Erreur lors du traitement de l'entrée ${entry.id}: ${entryError instanceof Error ? entryError.message : String(entryError)}`);
      }
    }
    
    onProgress?.(100);
    return { 
      success: true, 
      processed: entriesWithoutEmbedding.length, 
      succeeded: successCount 
    };
  } catch (error) {
    return { 
      success: false, 
      processed: 0, 
      succeeded: 0, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
};

/**
 * Updates both document and knowledge entry embeddings
 */
export const updateAllEmbeddings = async (
  onProgress?: (progress: number) => void,
  onLog?: (message: string) => void
): Promise<{
  success: boolean;
  documents: { success: boolean; count: number; error?: string };
  entries: { success: boolean; processed: number; succeeded: number; error?: string };
}> => {
  try {
    // Update document embeddings
    onLog?.("Mise à jour des embeddings des documents...");
    const docResult = await updateDocuments();
    
    if (docResult.success) {
      onLog?.(`${docResult.count} documents mis à jour avec succès.`);
    } else {
      onLog?.("Échec de la mise à jour des embeddings des documents.");
      if (docResult.error) onLog?.(docResult.error);
    }
    
    onProgress?.(50); // Set progress to 50% after documents
    
    // Update knowledge entries embeddings
    onLog?.("Mise à jour des embeddings des entrées de connaissances...");
    
    const entriesResult = await updateKnowledgeEntries(
      (entriesProgress) => {
        // Map entry progress (0-100) to overall progress (50-100)
        onProgress?.(50 + Math.floor(entriesProgress * 0.5));
      },
      onLog
    );
    
    onProgress?.(100);
    
    return {
      success: docResult.success || entriesResult.success,
      documents: docResult,
      entries: entriesResult
    };
  } catch (error) {
    return {
      success: false,
      documents: { success: false, count: 0 },
      entries: { success: false, processed: 0, succeeded: 0 }
    };
  }
};
