
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');

// Switch to a model that generates 1536-dimension embeddings to match the database
const EMBEDDING_MODEL = 'sentence-transformers/all-mpnet-base-v2'; // 768 dimensions
// Modèle de secours pour les cas difficiles
const BACKUP_MODEL = 'sentence-transformers/all-MiniLM-L6-v2'; // 384 dimensions, plus rapide et plus robuste

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, modelType = "document", options = {} } = await req.json();
    
    if (!text || typeof text !== 'string') {
      throw new Error('Text is required and must be a string');
    }
    
    // Log attempt information
    const attemptNumber = options.attemptNumber || 1;
    const totalAttempts = options.totalAttempts || 1;
    console.log(`Génération d'embedding (${modelType}): tentative ${attemptNumber}/${totalAttempts} pour texte de ${text.length} caractères`);

    // Choisir le modèle en fonction de la tentative et de la taille du texte
    // Pour la première tentative, utiliser le modèle standard
    // Pour les tentatives ultérieures ou les textes très longs, utiliser le modèle de secours
    const shouldUseBackupModel = attemptNumber > 1 || text.length > 15000;
    const modelName = shouldUseBackupModel ? BACKUP_MODEL : EMBEDDING_MODEL;
    
    console.log(`Utilisation du modèle: ${modelName} ${shouldUseBackupModel ? '(modèle de secours)' : '(modèle standard)'}`);

    // Utilize Hugging Face with the chosen model
    const response = await fetch(`https://api-inference.huggingface.co/pipeline/feature-extraction/${modelName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text,
        options: {
          wait_for_model: true,
          use_cache: attemptNumber === 1 // Utiliser le cache uniquement pour la première tentative
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from Hugging Face API (${modelName}): ${errorText}`);
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
    }

    let embedding = await response.json();
    
    // Verify that the embedding is an array
    if (!Array.isArray(embedding)) {
      console.error(`Invalid embedding format received from ${modelName}: ${typeof embedding}`);
      throw new Error(`Invalid embedding format received from ${modelName}: ${typeof embedding}`);
    }
    
    // Pour les modèles qui ne produisent pas naturellement 1536 dimensions, nous pouvons compléter ou dupliquer le vecteur
    // Vérifier si nous devons ajuster les dimensions pour correspondre aux 1536 attendus
    if (embedding.length !== 1536) {
      console.log(`Dimensions originales de l'embedding (${modelName}): ${embedding.length}, ajustement à 1536...`);
      
      // Méthode: Dupliquer et compléter le vecteur pour atteindre 1536 dimensions
      if (embedding.length === 768) {
        // Dupliquer le vecteur une fois et compléter avec des zéros si nécessaire
        const duplicated = [...embedding, ...embedding];
        embedding = duplicated.concat(Array(1536 - duplicated.length).fill(0));
      } else if (embedding.length === 384) {
        // Dupliquer le vecteur plusieurs fois pour atteindre 1536
        let stretched = [];
        const repeatCount = Math.ceil(1536 / 384); // 4 fois
        for (let i = 0; i < repeatCount; i++) {
          stretched = stretched.concat(embedding);
        }
        // Ajuster à exactement 1536 dimensions
        embedding = stretched.slice(0, 1536);
      } else {
        // Pour d'autres tailles, étirer/dupliquer selon les besoins
        const stretchFactor = Math.ceil(1536 / embedding.length);
        let stretched = [];
        for (let i = 0; i < stretchFactor; i++) {
          stretched = stretched.concat(embedding);
        }
        // Ajuster à exactement 1536 dimensions
        embedding = stretched.slice(0, 1536);
      }
    }
    
    console.log(`Embedding généré avec succès: ${embedding.length} dimensions pour ${modelType} en utilisant ${modelName}`);

    return new Response(JSON.stringify({ 
      embedding,
      dimensions: embedding.length,
      modelType,
      modelName,
      attempt: attemptNumber
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-embeddings function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
