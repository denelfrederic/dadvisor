
/**
 * Service pour générer des embeddings avec OpenAI
 */

import { OPENAI_API_KEY } from "../config.ts";
import { logMessage, logError } from "../utils/logging.ts";

// Configuration de l'API OpenAI
const OPENAI_EMBEDDING_MODEL = "text-embedding-ada-002";
const OPENAI_BASE_URL = "https://api.openai.com/v1";

/**
 * Vérifie la configuration et la disponibilité de l'API OpenAI
 * @returns Statut de la configuration OpenAI
 */
export async function checkOpenAIStatus() {
  try {
    if (!OPENAI_API_KEY) {
      return { 
        success: false, 
        valid: false,
        error: "La clé API OpenAI n'est pas configurée" 
      };
    }

    // Vérification simple de l'API
    const response = await fetch(`${OPENAI_BASE_URL}/models`, {
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { 
        success: false, 
        valid: false,
        error: `Erreur OpenAI: ${response.status} - ${errorText}` 
      };
    }

    const data = await response.json();
    
    // Rechercher le modèle d'embedding pour confirmer qu'il est disponible
    let modelFound = false;
    let modelName = OPENAI_EMBEDDING_MODEL;
    
    if (data.data && Array.isArray(data.data)) {
      modelFound = data.data.some((model: any) => 
        model.id === OPENAI_EMBEDDING_MODEL || 
        model.id.includes("embedding")
      );
      
      // Si le modèle spécifique n'est pas trouvé, chercher un autre modèle d'embedding
      if (!modelFound) {
        const embeddingModel = data.data.find((model: any) => model.id.includes("embedding"));
        if (embeddingModel) {
          modelFound = true;
          modelName = embeddingModel.id;
        }
      }
    }
    
    return { 
      success: true, 
      valid: true,
      model: modelName,
      modelFound
    };
  } catch (error) {
    logError("Erreur lors de la vérification de l'API OpenAI", error);
    return { 
      success: false, 
      valid: false,
      error: `Exception lors de la vérification OpenAI: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

/**
 * Génère un embedding pour un texte donné
 * @param text Texte pour lequel générer un embedding
 * @returns Vecteur d'embedding
 */
export async function generateEmbeddingWithOpenAI(text: string): Promise<number[]> {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error("La clé API OpenAI n'est pas configurée");
    }

    if (!text || text.trim() === "") {
      throw new Error("Le texte pour l'embedding ne peut pas être vide");
    }

    // Préparation de la requête OpenAI
    const response = await fetch(`${OPENAI_BASE_URL}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        input: text.slice(0, 8000), // Limite imposée par OpenAI
        model: OPENAI_EMBEDDING_MODEL
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur OpenAI: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    // Vérifier si la réponse a la structure attendue
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      throw new Error("Format de réponse OpenAI inattendu");
    }
    
    // S'assurer que l'embedding est un tableau de nombres
    const embedding = data.data[0].embedding;
    
    if (!Array.isArray(embedding)) {
      throw new Error("L'embedding n'est pas un tableau");
    }
    
    // Vérifier que tous les éléments sont des nombres
    if (!embedding.every(value => typeof value === 'number')) {
      throw new Error("L'embedding contient des valeurs non numériques");
    }
    
    console.log(`Embedding généré avec succès: ${embedding.length} dimensions`);
    return embedding;
  } catch (error) {
    logError("Erreur lors de la génération de l'embedding OpenAI", error);
    throw error;
  }
}

/**
 * Génère un embedding pour un texte donné (version test avec informations supplémentaires)
 * @param text Texte pour lequel générer un embedding
 * @returns Résultat du test, avec embedding et informations d'utilisation
 */
export async function generateTestEmbedding(text: string) {
  try {
    if (!OPENAI_API_KEY) {
      return { 
        success: false, 
        error: "La clé API OpenAI n'est pas configurée" 
      };
    }

    if (!text || text.trim() === "") {
      return {
        success: false,
        error: "Le texte ne peut pas être vide"
      };
    }

    // Préparation de la requête OpenAI
    const response = await fetch(`${OPENAI_BASE_URL}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        input: text.slice(0, 8000), // Limite imposée par OpenAI
        model: OPENAI_EMBEDDING_MODEL
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { 
        success: false, 
        error: `Erreur OpenAI: ${response.status} - ${errorText}` 
      };
    }

    const data = await response.json();
    
    // Vérifier si la réponse a la structure attendue
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      return {
        success: false,
        error: "Format de réponse OpenAI inattendu"
      };
    }

    return {
      success: true,
      embedding: data.data[0].embedding,
      modelName: OPENAI_EMBEDDING_MODEL,
      usage: data.usage
    };
  } catch (error) {
    logError("Erreur lors de la génération de l'embedding de test", error);
    return { 
      success: false, 
      error: `Exception: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}
