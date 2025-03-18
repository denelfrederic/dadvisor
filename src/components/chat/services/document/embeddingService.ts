
import { supabase } from "@/integrations/supabase/client";
import { parseEmbedding, prepareEmbeddingForStorage } from "@/components/knowledge-base/services/embedding/embeddingUtils";

// Fonction pour générer l'embedding à partir du texte
export const generateEmbedding = async (text: string, modelType = "document"): Promise<any> => {
  try {
    // Tronquer le texte si nécessaire (les API d'embedding ont souvent des limites de caractères)
    const truncatedText = text.slice(0, 10000);
    
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
    
    return data.embedding;
  } catch (error) {
    console.error("Exception lors de la génération de l'embedding:", error);
    throw error;
  }
};
