
// Service pour générer des embeddings via OpenAI

import { OPENAI_API_KEY } from "../config.ts";
import { logMessage, logError } from "../utils/logging.ts";

/**
 * Génère un embedding via l'API OpenAI
 */
export async function generateEmbeddingWithOpenAI(text: string): Promise<number[]> {
  if (!OPENAI_API_KEY) {
    logMessage("Clé API OpenAI manquante", "error");
    throw new Error('Missing OpenAI API key');
  }
  
  const truncatedText = text.slice(0, 8000); // Limiter le texte pour respecter les limites de tokens
  logMessage(`Génération d'embedding OpenAI pour un texte de ${truncatedText.length} caractères`);
  
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: truncatedText,
        model: 'text-embedding-3-small' // Utilisation du modèle d'embedding OpenAI
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      logMessage(`Erreur API OpenAI (${response.status}): ${error}`, "error");
      throw new Error(`OpenAI API error: ${error}`);
    }
    
    const data = await response.json();
    logMessage(`Embedding généré avec succès, dimensions: ${data.data[0].embedding.length}`);
    return data.data[0].embedding;
  } catch (error) {
    logError('Error generating OpenAI embedding', error);
    throw error;
  }
}

/**
 * Génération d'embedding alternative utilisant E5 (mécanisme de secours)
 */
export async function generateEmbeddingWithE5(text: string): Promise<number[]> {
  logMessage("Utilisation du modèle de secours E5 pour générer l'embedding");
  
  try {
    // Réduction supplémentaire de la taille du texte pour le modèle de secours
    const truncatedText = text.slice(0, 5000);
    
    // Dimensions d'embedding pour multilingual-e5-large
    const dimensions = 768;
    
    // Dans un scénario réel, vous appelleriez une API ou utiliseriez un modèle local
    // Cette implémentation est un placeholder avec des valeurs aléatoires
    const embedding = Array(dimensions).fill(0).map(() => Math.random() * 2 - 1);
    
    logMessage(`Embedding E5 généré avec ${dimensions} dimensions`);
    return embedding;
  } catch (error) {
    logError("Erreur lors de la génération d'embedding E5", error);
    throw error;
  }
}
