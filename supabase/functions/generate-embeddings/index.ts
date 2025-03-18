
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Modèles selon le type de contenu
const EMBEDDING_MODELS = {
  "document": 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2', // 384 dimensions
  "knowledge-entry": 'text-embedding-ada-002' // 1536 dimensions (OpenAI)
};

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

    // Choisir le bon modèle selon le type de contenu
    let embedding;
    
    if (modelType === "knowledge-entry" && OPENAI_API_KEY) {
      // Utiliser OpenAI pour les entrées de la base de connaissances (1536 dimensions)
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          model: "text-embedding-ada-002"
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error from OpenAI API: ${errorText}`);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      embedding = result.data[0].embedding;
      console.log(`OpenAI embedding generated: ${embedding.length} dimensions`);
    } else {
      // Utiliser Hugging Face pour les documents (384 dimensions)
      const modelName = EMBEDDING_MODELS[modelType] || EMBEDDING_MODELS.document;
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

      embedding = await response.json();
      console.log(`Hugging Face embedding generated: ${embedding.length} dimensions`);
    }

    return new Response(JSON.stringify({ 
      embedding,
      dimensions: embedding.length,
      modelType 
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
