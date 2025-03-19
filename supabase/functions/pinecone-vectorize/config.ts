
// Configuration pour la fonction Pinecone Vectorize

// Récupération des variables d'environnement avec valeurs par défaut et logging
export const PINECONE_API_KEY = Deno.env.get('PINECONE_API_KEY') || '';
export const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

// Configuration Pinecone corrigée
export const PINECONE_ENVIRONMENT = 'aped-4627-b74a'; // Environnement Pinecone confirmé
export const PINECONE_INDEX = 'dadvisor'; // Nom de l'index Pinecone
export const PINECONE_PROJECT = '3q5v9g1'; // ID du projet (extrait de l'URL)

// URLs construites correctement selon la structure Pinecone
export const PINECONE_BASE_URL = `https://${PINECONE_INDEX}-${PINECONE_PROJECT}.svc.${PINECONE_ENVIRONMENT}.pinecone.io`;
export const ALTERNATIVE_PINECONE_URL = `https://controller.${PINECONE_ENVIRONMENT}.pinecone.io/databases/${PINECONE_INDEX}/indices`;

// Validation de la configuration
export const validateConfig = () => {
  console.log(`Pinecone Edge Function initialisée`);
  console.log(`URL principale: ${PINECONE_BASE_URL}`);
  console.log(`URL alternative: ${ALTERNATIVE_PINECONE_URL}`);
  console.log(`Index: ${PINECONE_INDEX}, Environnement: ${PINECONE_ENVIRONMENT}, Projet: ${PINECONE_PROJECT}`);
  console.log(`API keys disponibles: Pinecone: ${PINECONE_API_KEY ? "Oui" : "Non"}, OpenAI: ${OPENAI_API_KEY ? "Oui" : "Non"}`);
  
  // Vérifier les variables requises
  if (!PINECONE_API_KEY) {
    console.error("ERREUR CRITIQUE: Clé API Pinecone manquante");
  }
  
  if (!OPENAI_API_KEY) {
    console.warn("AVERTISSEMENT: Clé API OpenAI manquante (utilisation du modèle de secours possible)");
  }
};

