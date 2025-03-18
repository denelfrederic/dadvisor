
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

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
    const { prompt, history = [], useRAG = false, documentContext = null } = await req.json();
    
    console.log("Received request with prompt:", prompt);
    console.log("Using RAG:", useRAG);
    
    // Prepare system message based on RAG mode
    let systemMessage = "Vous êtes un assistant IA financier qui répond aux questions des utilisateurs de manière claire, précise et professionnelle.";
    
    if (useRAG && documentContext) {
      systemMessage = `Vous êtes un assistant IA financier qui répond aux questions en vous basant UNIQUEMENT sur les informations contenues dans les documents fournis.
      
Si l'information demandée n'est pas présente dans les documents, répondez systématiquement: "Aucune information à ce sujet dans nos documents internes."

N'inventez JAMAIS de réponse qui n'est pas dans les documents. Référencez toujours la source du document quand c'est possible.`;
    }

    // Format messages for Gemini API
    const messages = [];
    
    // Add system message
    messages.push({
      role: "model",
      parts: [{ text: systemMessage }]
    });
    
    // Add document context if using RAG
    if (useRAG && documentContext) {
      messages.push({
        role: "user",
        parts: [{ text: "Voici les documents pertinents pour répondre à la prochaine question:" }]
      });
      
      messages.push({
        role: "model", 
        parts: [{ text: "Je vais analyser ces documents pour répondre à votre question." }]
      });
      
      messages.push({
        role: "user",
        parts: [{ text: documentContext }]
      });
      
      messages.push({
        role: "model",
        parts: [{ text: "J'ai pris connaissance des documents. Quelle est votre question?" }]
      });
    }
    
    // Add chat history
    history.forEach((msg: { role: string, content: string }) => {
      messages.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      });
    });
    
    // Add current user message
    messages.push({
      role: "user",
      parts: [{ text: prompt }]
    });
    
    console.log("Sending messages to Gemini API:", JSON.stringify(messages.length, null, 2));

    // Make request to Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages,
        generationConfig: {
          temperature: useRAG ? 0.1 : 0.7, // Lower temperature for RAG
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    const data = await response.json();
    
    console.log("Gemini API response status:", response.status);

    if (data.error) {
      throw new Error(`Gemini API Error: ${data.error.message}`);
    }

    const generatedText = data.candidates[0]?.content?.parts[0]?.text || "Désolé, je n'ai pas pu générer de réponse.";

    return new Response(JSON.stringify({ 
      response: generatedText,
      usedRAG: useRAG
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in gemini-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Une erreur s'est produite lors de la communication avec l'API Gemini." 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
