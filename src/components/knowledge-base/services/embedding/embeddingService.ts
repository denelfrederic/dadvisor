
import { parseEmbedding, prepareEmbeddingForStorage, isValidEmbedding, validateEmbeddingDimensions } from "./embeddingUtils";
import { supabase } from "@/integrations/supabase/client";

/**
 * Génère un embedding pour une entrée de la base de connaissances.
 * @param text Le texte pour lequel générer l'embedding
 * @returns Un tableau de nombres représentant l'embedding
 */
export const generateEntryEmbedding = async (text: string): Promise<number[] | null> => {
  try {
    if (!text || text.trim().length === 0) {
      console.error("Le texte ne peut pas être vide pour la génération d'embedding");
      return null;
    }
    
    console.log(`Génération d'embedding pour une entrée de connaissance, longueur du texte: ${text.length}`);
    
    // Appel à notre fonction edge pour générer l'embedding
    const { data, error } = await supabase.functions.invoke("generate-embeddings", {
      body: { 
        text: text.substring(0, 10000), // Limiter la taille du texte
        modelType: "knowledge-entry"
      }
    });
    
    if (error) {
      console.error("Erreur lors de la génération de l'embedding:", error);
      throw new Error(`Échec de la génération de l'embedding: ${error.message}`);
    }
    
    if (!data || !data.embedding) {
      console.error("La structure de l'embedding retourné est invalide:", data);
      throw new Error("Structure d'embedding invalide retournée par l'API");
    }
    
    if (!Array.isArray(data.embedding)) {
      console.error("L'embedding retourné n'est pas un tableau:", data.embedding);
      throw new Error("L'embedding retourné n'est pas un tableau");
    }
    
    // Vérifier les dimensions (doit être 1536 avec le nouveau modèle)
    if (data.embedding.length !== 1536) {
      console.warn(`Dimensions d'embedding inattendues: ${data.embedding.length}, attendu: 1536`);
    }
    
    console.log(`Embedding généré avec succès: ${data.embedding.length} dimensions, modèle: ${data.modelName || 'inconnu'}`);
    
    return data.embedding;
  } catch (error) {
    console.error("Exception lors de la génération de l'embedding:", error);
    throw error;
  }
};

/**
 * Met à jour les embeddings pour une entrée existante dans la base de données.
 */
export const updateEntryEmbedding = async (entryId: string, question: string, answer: string): Promise<boolean> => {
  try {
    // Vérifier si l'entrée existe
    const { data: existingEntry, error: fetchError } = await supabase
      .from('knowledge_entries')
      .select('id')
      .eq('id', entryId)
      .single();
    
    if (fetchError || !existingEntry) {
      console.error("Entrée non trouvée:", fetchError);
      return false;
    }
    
    // Générer l'embedding pour le texte combiné (question + réponse)
    const combinedText = `Question: ${question}\nRéponse: ${answer}`;
    const embedding = await generateEntryEmbedding(combinedText);
    
    if (!embedding) {
      console.error("Impossible de générer l'embedding");
      return false;
    }
    
    // Vérifier que l'embedding est valide et a les bonnes dimensions
    if (!validateEmbeddingDimensions(embedding, 1536)) {
      console.error(`Embedding généré avec des dimensions invalides: ${embedding.length}, attendu: 1536`);
      return false;
    }
    
    // Convertir l'embedding en format de stockage
    const embeddingStorage = prepareEmbeddingForStorage(embedding);
    
    // Mettre à jour l'entrée dans la base de données
    const { error: updateError } = await supabase
      .from('knowledge_entries')
      .update({ embedding: embeddingStorage })
      .eq('id', entryId);
    
    if (updateError) {
      console.error("Erreur lors de la mise à jour de l'embedding:", updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'embedding:", error);
    return false;
  }
};

// Exporter la fonction de validation pour utilisation dans d'autres modules
export { validateEmbeddingDimensions };
