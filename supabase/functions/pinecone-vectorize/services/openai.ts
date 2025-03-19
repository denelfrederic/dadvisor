
import { OPENAI_API_KEY } from "../config.ts";

/**
 * Vérifie la configuration OpenAI
 * @returns Résultat de la vérification
 */
export async function checkOpenAIStatus(): Promise<any> {
  try {
    console.log("Vérification de la configuration OpenAI...");
    
    // Vérifier si la clé API est configurée
    if (!OPENAI_API_KEY) {
      console.error("Clé API OpenAI manquante");
      return {
        success: false,
        error: "La clé API OpenAI n'est pas configurée"
      };
    }
    
    // Faire une requête simple pour vérifier l'accès à l'API
    const modelResponse = await fetch("https://api.openai.com/v1/models", {
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!modelResponse.ok) {
      const errorText = await modelResponse.text();
      console.error(`Erreur OpenAI (${modelResponse.status}): ${errorText}`);
      
      // Gérer les erreurs d'authentification
      if (modelResponse.status === 401) {
        return {
          success: false,
          error: "Clé API OpenAI invalide ou expirée"
        };
      }
      
      // Autres erreurs
      return {
        success: false,
        error: `Erreur API OpenAI (${modelResponse.status}): ${errorText}`
      };
    }
    
    const models = await modelResponse.json();
    
    // Vérifier si un modèle d'embedding est disponible
    const embeddingModels = models.data.filter((model: any) => 
      model.id.includes("text-embedding"));
    
    if (embeddingModels.length === 0) {
      return {
        success: true,
        model: "Aucun modèle d'embedding trouvé"
      };
    }
    
    // Préférer le modèle text-embedding-3-small s'il est disponible
    const preferredModel = embeddingModels.find((model: any) => 
      model.id === "text-embedding-3-small") || embeddingModels[0];
    
    return {
      success: true,
      model: preferredModel.id
    };
  } catch (error) {
    console.error("Erreur lors de la vérification OpenAI:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Génère un embedding pour un texte donné
 * @param text Texte pour lequel générer un embedding
 * @returns Embedding généré
 */
export async function generateEmbeddingWithOpenAI(text: string): Promise<number[]> {
  try {
    console.log(`Génération d'embedding pour: "${text.substring(0, 30)}..."`);
    
    if (!OPENAI_API_KEY) {
      console.error("Clé API OpenAI manquante");
      throw new Error("Clé API OpenAI non configurée");
    }
    
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: text,
        model: "text-embedding-3-small"
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur OpenAI (${response.status}): ${errorText}`);
      throw new Error(`Erreur API OpenAI (${response.status}): ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.data || !result.data[0] || !result.data[0].embedding) {
      console.error("Format de réponse OpenAI inattendu:", result);
      throw new Error("Format de réponse OpenAI inattendu");
    }
    
    return result.data[0].embedding;
  } catch (error) {
    console.error("Erreur lors de la génération d'embedding:", error);
    throw error;
  }
}

/**
 * Génère un embedding de test
 * @param text Texte pour lequel générer un embedding
 * @returns Résultat du test avec l'embedding
 */
export async function generateTestEmbedding(text: string): Promise<any> {
  try {
    console.log(`Génération d'embedding de test pour: "${text.substring(0, 30)}..."`);
    
    if (!OPENAI_API_KEY) {
      console.error("Clé API OpenAI manquante");
      return {
        success: false,
        error: "Clé API OpenAI non configurée"
      };
    }
    
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: text,
        model: "text-embedding-3-small"
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur OpenAI (${response.status}): ${errorText}`);
      return {
        success: false,
        error: `Erreur API OpenAI (${response.status}): ${errorText}`
      };
    }
    
    const result = await response.json();
    
    if (!result.data || !result.data[0] || !result.data[0].embedding) {
      console.error("Format de réponse OpenAI inattendu:", result);
      return {
        success: false,
        error: "Format de réponse OpenAI inattendu"
      };
    }
    
    return {
      success: true,
      embedding: result.data[0].embedding,
      modelName: result.model || "text-embedding-3-small",
      usage: result.usage
    };
  } catch (error) {
    console.error("Erreur lors de la génération d'embedding de test:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
