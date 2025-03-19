
// Configuration pour la fonction Pinecone Vectorize

// Récupération des variables d'environnement avec valeurs par défaut et logging
export const PINECONE_API_KEY = Deno.env.get('PINECONE_API_KEY') || '';
export const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

// Configuration Pinecone avec nouvelles variables basées sur la documentation officielle
export const PINECONE_INDEX = 'dadvisor'; // Nom de l'index
export const PINECONE_NAMESPACE = 'documents'; // Namespace par défaut

// Format d'URL de l'API Pinecone (selon la documentation officielle la plus récente)
// Format de base : https://{index-name}-{project-id}.svc.{environment}.pinecone.io
export const PINECONE_HOST = 'dadvisor-3q5v9g1.svc.aped-4627-b74a.pinecone.io';
export const PINECONE_BASE_URL = `https://${PINECONE_HOST}`;

// Timeout de requête (en millisecondes) - augmenté pour éviter les expirations
export const REQUEST_TIMEOUT = 45000; // 45 secondes

// Validation de la configuration
export const validateConfig = () => {
  console.log(`Configuration Pinecone :`);
  console.log(`Index: ${PINECONE_INDEX}`);
  console.log(`URL base: ${PINECONE_BASE_URL}`);
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
      namespace: PINECONE_NAMESPACE,
      host: PINECONE_HOST,
      baseUrl: PINECONE_BASE_URL
    }
  };
};

// Fonction pour tester la connexion à Pinecone
export const testPineconeConnection = async () => {
  try {
    console.log(`Test de connexion à Pinecone: ${PINECONE_BASE_URL}/describe_index_stats`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    const response = await fetch(`${PINECONE_BASE_URL}/describe_index_stats`, {
      method: 'GET',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Accept': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur Pinecone (${response.status}): ${errorText}`);
      return {
        success: false,
        status: response.status,
        message: `Échec de la connexion: ${response.status} ${response.statusText}`,
        details: errorText
      };
    }
    
    const data = await response.json();
    console.log(`Connexion Pinecone réussie:`, data);
    
    return {
      success: true,
      status: response.status,
      message: "Connexion à Pinecone réussie",
      data
    };
  } catch (error) {
    console.error("Erreur lors du test de connexion:", error);
    return {
      success: false,
      message: `Exception: ${error instanceof Error ? error.message : String(error)}`,
      error: String(error)
    };
  }
};
