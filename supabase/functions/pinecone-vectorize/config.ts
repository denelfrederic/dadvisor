
// Configuration pour la fonction Pinecone Vectorize

// Récupération des variables d'environnement avec valeurs par défaut et logging
export const PINECONE_API_KEY = Deno.env.get('PINECONE_API_KEY') || '';
export const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
export const PINECONE_ENVIRONMENT = 'aped-4627-b74a'; // Environnement Pinecone confirmé
export const PINECONE_INDEX = 'dadvisor'; // Nom de l'index Pinecone 
// URL complète basée sur l'URL fournie par l'utilisateur
export const PINECONE_BASE_URL = `https://dadvisor-3q5v9g1.svc.${PINECONE_ENVIRONMENT}.pinecone.io`;
export const ALTERNATIVE_PINECONE_URL = `https://${PINECONE_INDEX}.svc.${PINECONE_ENVIRONMENT}.pinecone.io`;

// Validation de la configuration
export const validateConfig = () => {
  console.log(`Pinecone Edge Function initialisée. URL: ${PINECONE_BASE_URL}`);
  console.log(`Index: ${PINECONE_INDEX}, Environnement: ${PINECONE_ENVIRONMENT}`);
  console.log(`API keys disponibles: Pinecone: ${PINECONE_API_KEY ? "Oui" : "Non"}, OpenAI: ${OPENAI_API_KEY ? "Oui" : "Non"}`);
  
  // Vérifier les variables requises
  if (!PINECONE_API_KEY) {
    console.error("ERREUR CRITIQUE: Clé API Pinecone manquante");
  }
  
  if (!OPENAI_API_KEY) {
    console.error("ERREUR CRITIQUE: Clé API OpenAI manquante");
  }
};
