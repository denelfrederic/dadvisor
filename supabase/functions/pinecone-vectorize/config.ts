
// Configuration pour la fonction Pinecone Vectorize

// Récupération des variables d'environnement avec valeurs par défaut et logging
export const PINECONE_API_KEY = Deno.env.get('PINECONE_API_KEY') || '';
export const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

// Configuration Pinecone vérifiée
export const PINECONE_INDEX = 'dadvisor'; // Nom de l'index
export const PINECONE_PROJECT = '3q5v9g1'; // ID du projet 
export const PINECONE_ENVIRONMENT = 'aped-4627-b74a'; // Environnement confirmé

// API v1 (ancienne structure) - sera utilisée en premier
export const PINECONE_API_V1_URL = `https://${PINECONE_INDEX}-${PINECONE_PROJECT}.svc.${PINECONE_ENVIRONMENT}.pinecone.io`;

// API v2 (nouvelle structure) - structure alternative pour les nouvelles versions
export const PINECONE_API_V2_URL = `https://controller.${PINECONE_ENVIRONMENT}.pinecone.io/databases/${PINECONE_INDEX}/indices`;

// Troisième alternative : URL directe avec le nom d'hôte complet
export const PINECONE_DIRECT_URL = `https://dadvisor-3q5v9g1.svc.aped-4627-b74a.pinecone.io`;

// Timeout de requête (en millisecondes) - augmenté pour éviter les expirations
export const REQUEST_TIMEOUT = 30000; // 30 secondes

// Validation de la configuration
export const validateConfig = () => {
  console.log(`Configuration Pinecone :`);
  console.log(`Index: ${PINECONE_INDEX}`);
  console.log(`Projet: ${PINECONE_PROJECT}`);
  console.log(`Environnement: ${PINECONE_ENVIRONMENT}`);
  console.log(`URL API v1: ${PINECONE_API_V1_URL}`);
  console.log(`URL API v2: ${PINECONE_API_V2_URL}`);
  console.log(`URL directe: ${PINECONE_DIRECT_URL}`);
  console.log(`Timeout: ${REQUEST_TIMEOUT}ms`);
  console.log(`API keys disponibles: Pinecone: ${PINECONE_API_KEY ? "Oui" : "Non"}, OpenAI: ${OPENAI_API_KEY ? "Oui" : "Non"}`);
  
  const warnings = [];
  
  if (!PINECONE_API_KEY) {
    warnings.push("ERREUR CRITIQUE: Clé API Pinecone manquante");
  }
  
  if (!OPENAI_API_KEY) {
    warnings.push("AVERTISSEMENT: Clé API OpenAI manquante (utilisation du modèle de secours possible)");
  }
  
  return {
    valid: Boolean(PINECONE_API_KEY),
    warnings,
    config: {
      indexName: PINECONE_INDEX,
      projectId: PINECONE_PROJECT,
      environment: PINECONE_ENVIRONMENT,
      apiUrls: {
        v1: PINECONE_API_V1_URL,
        v2: PINECONE_API_V2_URL,
        direct: PINECONE_DIRECT_URL
      }
    }
  };
};
