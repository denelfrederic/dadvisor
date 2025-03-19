
// Service pour la génération d'embeddings avec OpenAI
import { OPENAI_API_KEY } from "../config.ts";

/**
 * Configuration d'OpenAI
 */
const OPENAI_API_URL = "https://api.openai.com/v1";
const EMBEDDING_MODEL = "text-embedding-ada-002";
const DEFAULT_DIMENSIONS = 1536; // Dimensions du modèle embedding-ada-002

/**
 * Headers pour les requêtes OpenAI
 */
const OPENAI_HEADERS = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${OPENAI_API_KEY}`
};

/**
 * Vérifie si la configuration OpenAI est valide
 * @returns Un objet indiquant si la configuration est valide
 */
export async function checkOpenAIStatus(): Promise<any> {
  try {
    console.log("Vérification de la configuration OpenAI...");
    
    if (!OPENAI_API_KEY) {
      return { 
        success: false, 
        error: "Clé API OpenAI manquante",
        timestamp: new Date().toISOString()
      };
    }
    
    // Test simple avec le endpoint models
    const response = await fetch(`${OPENAI_API_URL}/models`, {
      method: 'GET',
      headers: OPENAI_HEADERS
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur API OpenAI (${response.status}): ${errorText}`);
      return { 
        success: false, 
        error: `Erreur API: ${response.status} ${errorText}`,
        status: response.status,
        timestamp: new Date().toISOString()
      };
    }
    
    const data = await response.json();
    
    // Vérifie si le modèle d'embedding requis est disponible
    const hasEmbeddingModel = data.data.some((model: any) => model.id === EMBEDDING_MODEL);
    
    return {
      success: true,
      model: EMBEDDING_MODEL,
      hasEmbeddingModel,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Erreur lors de la vérification OpenAI:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Génère un embedding pour un texte
 * @param text Le texte à transformer en embedding
 * @returns Un vecteur d'embedding
 */
export async function generateEmbeddingWithOpenAI(text: string): Promise<number[]> {
  try {
    console.log(`Génération d'embedding pour un texte de ${text.length} caractères`);
    
    // Validation de la clé API
    if (!OPENAI_API_KEY) {
      throw new Error("Clé API OpenAI manquante");
    }
    
    // Préparation du corps de la requête
    const requestBody = JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text
    });
    
    // Envoi de la requête à l'API OpenAI
    const response = await fetch(`${OPENAI_API_URL}/embeddings`, {
      method: 'POST',
      headers: OPENAI_HEADERS,
      body: requestBody
    });
    
    // Vérification des erreurs
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur API OpenAI pour embedding (${response.status}): ${errorText}`);
      throw new Error(`Erreur API OpenAI: ${response.status} ${errorText}`);
    }
    
    // Traitement de la réponse
    const result = await response.json();
    
    // Extraction du vecteur d'embedding
    const embedding = result.data?.[0]?.embedding;
    
    // Vérification de la validité du résultat
    if (!embedding || !Array.isArray(embedding)) {
      console.error("Réponse OpenAI invalide:", result);
      throw new Error("Réponse d'embedding invalide de l'API OpenAI");
    }
    
    console.log(`Embedding généré avec succès (${embedding.length} dimensions)`);
    
    return embedding;
  } catch (error) {
    console.error("Erreur lors de la génération d'embedding:", error);
    throw error;
  }
}

/**
 * Génère un embedding de test pour un texte
 * Similaire à generateEmbeddingWithOpenAI mais retourne plus d'informations
 * @param text Le texte à transformer en embedding
 * @returns Un objet contenant le vecteur d'embedding et des métadonnées
 */
export async function generateTestEmbedding(text: string): Promise<any> {
  try {
    console.log(`Génération d'embedding de test pour: "${text.substring(0, 50)}..."`);
    
    // Validation de la clé API
    if (!OPENAI_API_KEY) {
      return {
        success: false,
        error: "Clé API OpenAI manquante"
      };
    }
    
    // Préparation du corps de la requête
    const requestBody = JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text
    });
    
    // Envoi de la requête à l'API OpenAI
    const response = await fetch(`${OPENAI_API_URL}/embeddings`, {
      method: 'POST',
      headers: OPENAI_HEADERS,
      body: requestBody
    });
    
    // Vérification des erreurs
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur API OpenAI pour embedding de test (${response.status}): ${errorText}`);
      return {
        success: false,
        error: `Erreur API OpenAI: ${response.status} ${errorText}`,
        status: response.status
      };
    }
    
    // Traitement de la réponse
    const result = await response.json();
    
    // Extraction du vecteur d'embedding
    const embedding = result.data?.[0]?.embedding;
    
    // Vérification de la validité du résultat
    if (!embedding || !Array.isArray(embedding)) {
      console.error("Réponse OpenAI invalide:", result);
      return {
        success: false,
        error: "Réponse d'embedding invalide de l'API OpenAI"
      };
    }
    
    console.log(`Embedding de test généré avec succès (${embedding.length} dimensions)`);
    
    // Retourne l'embedding avec des informations supplémentaires
    return {
      success: true,
      embedding: embedding,
      modelName: EMBEDDING_MODEL,
      dimensions: embedding.length,
      usage: result.usage,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Erreur lors de la génération d'embedding de test:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
