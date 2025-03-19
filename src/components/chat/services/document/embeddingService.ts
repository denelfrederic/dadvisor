
import { supabase } from "@/integrations/supabase/client";
import { parseEmbedding, prepareEmbeddingForStorage, isValidEmbedding } from "@/components/knowledge-base/services/embedding/embeddingUtils";

// Fonction pour générer l'embedding à partir du texte
export const generateEmbedding = async (text: string, modelType = "document"): Promise<any> => {
  try {
    // Tronquer le texte si nécessaire (les API d'embedding ont souvent des limites de caractères)
    const truncatedText = text.slice(0, 10000);
    
    console.log(`Générant embedding pour ${modelType}, longueur texte: ${truncatedText.length} caractères`);
    
    // Appel à notre fonction edge pour générer l'embedding
    const { data, error } = await supabase.functions.invoke("generate-embeddings", {
      body: { 
        text: truncatedText,
        modelType
      }
    });
    
    if (error) {
      console.error("Erreur lors de la génération de l'embedding:", error);
      throw new Error("Échec de la génération de l'embedding");
    }
    
    if (!data || !data.embedding || !Array.isArray(data.embedding) || data.embedding.length === 0) {
      console.error("Embedding généré est invalide:", data);
      throw new Error("L'embedding généré est invalide ou vide");
    }
    
    console.log(`Embedding généré avec succès: ${data.embedding.length} dimensions, modèle: ${data.modelName}`);
    
    // Vérifier que l'embedding est valide - accepter 384, 768 ou 1536 dimensions
    if (!isValidEmbedding(data.embedding)) {
      console.error("Embedding généré n'est pas valide:", data.embedding.slice(0, 5), "...");
      throw new Error("L'embedding généré n'est pas valide");
    }
    
    return data.embedding;
  } catch (error) {
    console.error("Exception lors de la génération de l'embedding:", error);
    throw error;
  }
};
