
// Configuration and environment variables for the Pinecone edge function

// Get environment variables with fallbacks and logging
export const PINECONE_API_KEY = Deno.env.get('PINECONE_API_KEY') || '';
export const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
export const PINECONE_ENVIRONMENT = 'aped-4627-b74a'; // Update to match your Pinecone environment
export const PINECONE_INDEX = 'dadvisor-3q5v9g1'; // Update to match your index name
export const PINECONE_BASE_URL = `https://${PINECONE_INDEX}.svc.${PINECONE_ENVIRONMENT}.pinecone.io`;

// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize logging
console.log(`Pinecone Edge Function initialisée. Environnement: ${PINECONE_ENVIRONMENT}, Index: ${PINECONE_INDEX}`);
console.log(`API keys disponibles: Pinecone: ${PINECONE_API_KEY ? "Oui" : "Non"}, OpenAI: ${OPENAI_API_KEY ? "Oui" : "Non"}`);

// Vérifier les variables requises
if (!PINECONE_API_KEY) {
  console.error("ERREUR CRITIQUE: Clé API Pinecone manquante");
}

if (!OPENAI_API_KEY) {
  console.error("ERREUR CRITIQUE: Clé API OpenAI manquante");
}

// Add a simple logging function
export function addLog(message: string) {
  console.log(message);
  return message;
}
