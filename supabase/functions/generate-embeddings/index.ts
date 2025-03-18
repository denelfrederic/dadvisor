
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');

// Modèles spécifiques pour les différents types d'embedding avec les dimensions correctes
const DOCUMENT_MODEL = 'sentence-transformers/all-mpnet-base-v2'; // 768 dimensions
const KNOWLEDGE_ENTRY_MODEL = 'sentence-transformers/all-MiniLM-L12-v2'; // 384 dimensions

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
    const { text, modelType = "document" } = await req.json();
    
    if (!text || typeof text !== 'string') {
      throw new Error('Text is required and must be a string');
    }

    console.log(`Generating embedding for ${modelType} text: ${text.substring(0, 100)}...`);

    // Sélection du modèle en fonction du type
    const modelName = modelType === "knowledge-entry" 
      ? KNOWLEDGE_ENTRY_MODEL 
      : DOCUMENT_MODEL;

    // Utiliser Hugging Face avec le modèle approprié
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
          use_cache: true
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from Hugging Face API: ${errorText}`);
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
    }

    const embedding = await response.json();
    console.log(`Embedding generated successfully: ${embedding.length} dimensions for ${modelType} using ${modelName}`);

    return new Response(JSON.stringify({ 
      embedding,
      dimensions: embedding.length,
      modelType,
      modelName
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-embeddings function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
