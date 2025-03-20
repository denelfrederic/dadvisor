
/**
 * Service pour interagir avec l'API OpenAI
 */

import { OPENAI_API_KEY } from "../config.ts";
import { logMessage, logError } from "../utils/logging.ts";

// URL de l'API OpenAI pour les embeddings
const OPENAI_EMBEDDING_URL = "https://api.openai.com/v1/embeddings";
// Modèle par défaut pour les embeddings
const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";

/**
 * Génère un embedding pour un texte via l'API OpenAI
 * @param text Texte à vectoriser
 * @param model Modèle à utiliser (optionnel)
 * @returns Embedding (vecteur) et métadonnées
 */
export async function generateEmbeddingWithOpenAI(
  text: string, 
  model: string = DEFAULT_EMBEDDING_MODEL
) {
  try {
    // Vérifier que la clé API est définie
    if (!OPENAI_API_KEY) {
      logMessage("Clé API OpenAI non configurée", "error");
      return { 
        success: false, 
        error: "Clé API OpenAI manquante" 
      };
    }
    
    // Tronquer le texte pour éviter des coûts excessifs si nécessaire
    const truncatedText = text.length > 8000 ? text.substring(0, 8000) : text;
    
    if (text.length > 8000) {
      logMessage(`Texte tronqué de ${text.length} à 8000 caractères`, "warning");
    }
    
    // Préparer la requête
    const requestBody = {
      input: truncatedText,
      model: model,
      encoding_format: "float"
    };
    
    logMessage(`Envoi de la requête d'embedding (${truncatedText.length} caractères)`, "info");
    
    // Faire la requête à l'API OpenAI
    const response = await fetch(OPENAI_EMBEDDING_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });
    
    // Vérifier le statut HTTP
    if (!response.ok) {
      const errorData = await response.text();
      logMessage(`Erreur de l'API OpenAI: ${response.status} ${response.statusText}`, "error");
      logMessage(`Détails de l'erreur: ${errorData}`, "error");
      
      return { 
        success: false, 
        error: `Erreur de l'API OpenAI: ${response.status} ${response.statusText}`,
        details: errorData
      };
    }
    
    // Extraire les données de la réponse
    const data = await response.json();
    
    // Vérifier la structure de la réponse
    if (!data || !data.data || !data.data[0] || !data.data[0].embedding) {
      logMessage("Format de réponse OpenAI invalide", "error");
      return { 
        success: false, 
        error: "Format de réponse OpenAI invalide",
        responseData: data
      };
    }
    
    // Extraire l'embedding
    const embedding = data.data[0].embedding;
    const dimensions = embedding.length;
    
    logMessage(`Embedding généré avec succès (${dimensions} dimensions)`, "info");
    
    // Renvoyer l'embedding et les métadonnées
    return {
      success: true,
      embedding: embedding,
      model: data.model || model,
      dimensions: dimensions,
      usage: data.usage || null
    };
  } catch (error) {
    // Journaliser et retourner l'erreur
    const errorMessage = logError("Erreur lors de la génération de l'embedding", error);
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

/**
 * Vérifie la configuration OpenAI et la validité de la clé API
 * @returns Résultat de la vérification
 */
export async function checkOpenAIConfiguration() {
  try {
    // Vérifier si la clé API est configurée
    if (!OPENAI_API_KEY) {
      return {
        success: false,
        error: "Clé API OpenAI non configurée"
      };
    }
    
    // Faire une requête minimale pour vérifier la validité de la clé
    const testText = "test";
    const result = await generateEmbeddingWithOpenAI(testText);
    
    // Retourner le résultat de la vérification
    return result.success 
      ? { 
          success: true, 
          model: result.model,
          dimensions: result.dimensions
        }
      : { 
          success: false, 
          error: result.error || "Échec de la génération d'embedding de test" 
        };
  } catch (error) {
    // Journaliser et retourner l'erreur
    const errorMessage = logError("Erreur lors de la vérification de la configuration OpenAI", error);
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

// Exporter les fonctions
export { generateEmbeddingWithOpenAI as generateEmbedding };
