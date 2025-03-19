
/**
 * Utilitaire pour optimiser les requêtes OpenAI et gérer les erreurs
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Vérifie la configuration OpenAI pour le service d'embedding
 */
export const checkOpenAIConfig = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
      body: { action: 'check-openai' }
    });
    
    if (error) {
      console.error("Erreur lors de la vérification OpenAI:", error);
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error("Exception lors de la vérification OpenAI:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Génère un embedding de test pour vérifier le service OpenAI
 */
export const generateTestEmbedding = async (text: string = "Ceci est un test d'embedding") => {
  try {
    const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
      body: { 
        action: 'generate-embedding',
        text
      }
    });
    
    if (error) {
      console.error("Erreur lors de la génération d'embedding:", error);
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error("Exception lors de la génération d'embedding:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
