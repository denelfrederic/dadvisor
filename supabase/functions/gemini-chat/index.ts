
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

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
    
    console.log("Received request with prompt:", prompt.substring(0, 100));
    console.log("Using RAG:", useRAG);
    
    // Message système détaillé avec informations spécifiques à DADVISOR
    let systemMessage = `Vous êtes l'assistant virtuel de DADVISOR, une plateforme technologique et financière permettant aux investisseurs d'accéder à des actifs diversifiés . 
    Elle simplifie l'investissement en combinant crypto-actifs, actifs traditionnels et finance décentralisée tout en garantissant la transparence, la sécurité et la conformité. 
    Elle évolue pour offrir une expérience d'investissement intuitive et sécurisée, notamment grâce à des wallets décentralisés et un cadre réglementaire robuste.
    DADVISOR aide également les investisseurs à choisir comment investir en toute indépendance grâce à un outil de profilage permettant de définir leur niveau de connaissance et de tolérance aux risques afin de faire le meilleur choix en toute autonomie.

Votre mission est de fournir des informations précises sur les services de DADVISOR

Répondez de façon professionnelle mais accessible, en utilisant un ton courtois et rassurant. 
Évitez tout jargon technique excessif et privilégiez des explications claires.

Rappelez-vous que vous représentez DADVISOR et que la qualité de vos réponses reflète l'image de l'entreprise.`;
    
    if (useRAG && documentContext) {
      systemMessage = `Vous êtes l'assistant virtuel de DADVISOR, une plateforme technologique et financière permettant aux investisseurs d'accéder à des actifs diversifiés . 
    Elle simplifie l'investissement en combinant crypto-actifs, actifs traditionnels et finance décentralisée tout en garantissant la transparence, la sécurité et la conformité. 
    Elle évolue pour offrir une expérience d'investissement intuitive et sécurisée, notamment grâce à des wallets décentralisés et un cadre réglementaire robuste.
    DADVISOR aide également les investisseurs à choisir comment investir en toute indépendance grâce à un outil de profilage permettant de définir leur niveau de connaissance et de tolérance aux risques afin de faire le meilleur choix en toute autonomie.

Votre mission est de fournir des informations précises sur les services de DADVISOR

Répondez de façon professionnelle mais accessible, en utilisant un ton courtois et rassurant. 
Évitez tout jargon technique excessif et privilégiez des explications claires.

Voici les règles précises à suivre:
1. Utilisez UNIQUEMENT les informations contenues dans les documents fournis pour répondre aux questions sur DADVISOR
2. Si les documents fournissent une information partielle, utilisez-la comme base et complétez-la de façon cohérente
3. Si l'information demandée n'est PAS DU TOUT présente dans les documents, répondez exactement: "Je ne trouve pas d'information spécifique sur ce sujet dans notre base de connaissances DADVISOR. Je vous invite à contacter directement notre équipe pour obtenir des précisions."
4. N'inventez JAMAIS de données spécifiques (tarifs, rendements, noms de conseillers) qui ne sont pas mentionnées dans les documents
5. Citez vos sources quand c'est possible, en mentionnant "D'après notre [nom du document/base de connaissances]..."

Répondez de façon professionnelle mais accessible, en utilisant un ton courtois et rassurant qui reflète l'image de DADVISOR.`;
    }

    // Formater les messages pour l'API OpenAI
    const messages = [];
    
    // Ajout du message système
    messages.push({
      role: "system",
      content: systemMessage
    });
    
    // Optimisation de l'intégration du contexte documentaire
    if (useRAG && documentContext) {
      messages.push({
        role: "user",
        content: "Voici les documents et informations pertinentes de DADVISOR pour répondre à la prochaine question:"
      });
      
      messages.push({
        role: "assistant", 
        content: "Je vais analyser soigneusement ces informations de DADVISOR pour vous répondre avec précision."
      });
      
      messages.push({
        role: "user",
        content: documentContext
      });
      
      messages.push({
        role: "assistant",
        content: "J'ai pris connaissance des informations DADVISOR. Comment puis-je vous aider aujourd'hui?"
      });
    }
    
    // Ajout de l'historique des conversations
    history.forEach((msg: { role: string, content: string }) => {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      });
    });
    
    // Ajout du message utilisateur actuel
    messages.push({
      role: "user",
      content: prompt
    });
    
    console.log("Sending messages to OpenAI API:", JSON.stringify(messages.length, null, 2));

    // Requête à l'API OpenAI avec des paramètres optimisés
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        temperature: useRAG ? 0.1 : 0.7, // Température plus basse pour RAG
        max_tokens: 1024,
        top_p: 0.95,
      }),
    });

    const data = await response.json();
    
    console.log("OpenAI API response status:", response.status);

    if (data.error) {
      throw new Error(`OpenAI API Error: ${data.error.message || data.error}`);
    }

    const generatedText = data.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse.";

    return new Response(JSON.stringify({ 
      response: generatedText,
      usedRAG: useRAG
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in openai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Une erreur s'est produite lors de la communication avec l'API OpenAI." 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
