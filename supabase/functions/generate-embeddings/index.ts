
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');

// Switch to a model that generates 1536-dimension embeddings to match the database
const EMBEDDING_MODEL = 'sentence-transformers/all-mpnet-base-v2'; // 768 dimensions
// Using OpenAI's text-embedding-3-small model would also work with 1536 dimensions
// but that would require an OpenAI API key

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

    // Use the model that generates appropriate dimensions
    const modelName = EMBEDDING_MODEL;

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
          use_cache: true
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from Hugging Face API: ${errorText}`);
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
    }

    let embedding = await response.json();
    
    // Verify that the embedding is an array
    if (!Array.isArray(embedding)) {
      console.error(`Invalid embedding format received: ${typeof embedding}`);
      throw new Error(`Invalid embedding format received: ${typeof embedding}`);
    }
    
    // For models that don't naturally produce 1536 dimensions, we can pad or duplicate the vector
    // Check if we need to adjust dimensions to match the expected 1536
    if (embedding.length !== 1536) {
      console.log(`Original embedding dimensions: ${embedding.length}, padding to 1536...`);
      
      // Method: Duplicate and pad the vector to reach 1536 dimensions
      // For a 768-dimension vector, we duplicate it once and then pad with zeros if needed
      if (embedding.length === 768) {
        // Duplicate the vector
        const duplicated = [...embedding, ...embedding];
        // If needed, pad with zeros to reach 1536
        embedding = duplicated.concat(Array(1536 - duplicated.length).fill(0));
      } else {
        // For other dimension sizes, stretch/duplicate as needed
        const stretchFactor = Math.ceil(1536 / embedding.length);
        let stretched = [];
        for (let i = 0; i < stretchFactor; i++) {
          stretched = stretched.concat(embedding);
        }
        // Trim to exactly 1536 dimensions
        embedding = stretched.slice(0, 1536);
      }
    }
    
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
