
// Service pour générer des embeddings via OpenAI

import { OPENAI_API_KEY } from "../config.ts";

/**
 * Génère un embedding via l'API OpenAI
 */
export async function generateEmbeddingWithOpenAI(text: string): Promise<number[]> {
  if (!OPENAI_API_KEY) {
    console.error("Clé API OpenAI manquante");
    throw new Error('Missing OpenAI API key');
  }
  
  const truncatedText = text.slice(0, 8000); // Limiter le texte pour respecter les limites de tokens
  console.log(`Génération d'embedding OpenAI pour un texte de ${truncatedText.length} caractères`);
  
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
      console.error(`Erreur API OpenAI (${response.status}): ${error}`);
      
      // Inclure des informations plus détaillées sur l'erreur
      let errorDetails = `Statut: ${response.status}, Texte: ${error}`;
      
      // Vérification des erreurs courantes
      if (response.status === 401) {
        errorDetails += " - Vérifiez que votre clé API OpenAI est valide et correctement configurée.";
      } else if (response.status === 429) {
        errorDetails += " - Limite de requêtes atteinte. Attendez un moment ou vérifiez votre quota OpenAI.";
      } else if (response.status === 400) {
        errorDetails += " - Requête invalide. Vérifiez le format des données envoyées.";
      }
      
      throw new Error(`OpenAI API error: ${errorDetails}`);
    }
    
    const data = await response.json();
    console.log(`Embedding généré avec succès, dimensions: ${data.data[0].embedding.length}`);
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating OpenAI embedding', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Génération d'embedding alternative utilisant E5 (mécanisme de secours)
 */
export async function generateEmbeddingWithE5(text: string): Promise<number[]> {
  console.log("Utilisation du modèle de secours E5 pour générer l'embedding");
  
  try {
    // Réduction supplémentaire de la taille du texte pour le modèle de secours
    const truncatedText = text.slice(0, 5000);
    
    // Dimensions d'embedding pour multilingual-e5-large
    const dimensions = 768;
    
    // Dans un scénario réel, vous appelleriez une API ou utiliseriez un modèle local
    // Cette implémentation est un placeholder avec des valeurs aléatoires
    const embedding = Array(dimensions).fill(0).map(() => Math.random() * 2 - 1);
    
    console.log(`Embedding E5 généré avec ${dimensions} dimensions`);
    return embedding;
  } catch (error) {
    console.error("Erreur lors de la génération d'embedding E5", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Vérification du statut d'OpenAI
 */
export async function checkOpenAIStatus(): Promise<{success: boolean; model?: string; error?: string}> {
  if (!OPENAI_API_KEY) {
    console.log("Vérification OpenAI: Clé API manquante");
    return {
      success: false,
      error: "Clé API OpenAI non configurée"
    };
  }
  
  try {
    // Vérifier l'accès à l'API OpenAI avec une petite requête
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur vérification OpenAI (${response.status}): ${errorText}`);
      return {
        success: false,
        error: `Erreur d'API (${response.status}): ${errorText}`
      };
    }
    
    const data = await response.json();
    
    // Vérifier si le modèle d'embedding est disponible
    const embeddingModel = data.data.find((model: any) => 
      model.id === 'text-embedding-3-small' || model.id === 'text-embedding-ada-002'
    );
    
    console.log(`Vérification OpenAI réussie, modèle d'embedding: ${embeddingModel?.id || 'non trouvé'}`);
    
    return {
      success: true,
      model: embeddingModel?.id || 'text-embedding-3-small'
    };
  } catch (error) {
    console.error("Erreur lors de la vérification OpenAI:", error instanceof Error ? error.message : String(error));
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue"
    };
  }
}

/**
 * Génère un embedding de test
 */
export async function generateTestEmbedding(text: string): Promise<{embedding: number[], modelName: string}> {
  try {
    console.log(`Génération d'un embedding de test pour: "${text.substring(0, 30)}..."`);
    const embedding = await generateEmbeddingWithOpenAI(text);
    
    return {
      embedding,
      modelName: 'text-embedding-3-small'
    };
  } catch (error) {
    console.error("Erreur lors de la génération d'embedding de test:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}
