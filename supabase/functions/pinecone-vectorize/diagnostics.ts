
// Diagnostic functions for testing Pinecone connection

import { PINECONE_API_KEY, PINECONE_BASE_URL, PINECONE_ENVIRONMENT, PINECONE_INDEX } from "./config.ts";

// Test the Pinecone configuration
export async function testPineconeConnection() {
  console.log("Testant la connexion à Pinecone...");
  console.log(`URL de base: ${PINECONE_BASE_URL}`);
  
  try {
    if (!PINECONE_API_KEY) {
      return {
        success: false,
        error: "Clé API Pinecone non configurée",
        details: { 
          apiKeyStatus: 'missing',
          environment: PINECONE_ENVIRONMENT,
          index: PINECONE_INDEX,
          suggestions: [
            "Configurez la clé API Pinecone dans les secrets Supabase",
            "Vérifiez que la clé est correctement nommée PINECONE_API_KEY"
          ]
        }
      };
    }
    
    // Tester la connexion à l'API Pinecone avec un appel simple
    const response = await fetch(`${PINECONE_BASE_URL}/describe_index_stats`, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ namespace: 'documents' }),
    });
    
    console.log(`Statut de la réponse Pinecone: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur API Pinecone (${response.status}): ${errorText}`);
      
      let suggestedActions = [];
      if (response.status === 404) {
        suggestedActions = [
          "Vérifiez que l'index existe dans votre compte Pinecone",
          "Vérifiez que le nom de l'index est correctement orthographié",
          "Vérifiez que l'environnement est correct"
        ];
      } else if (response.status === 401 || response.status === 403) {
        suggestedActions = [
          "Vérifiez que votre clé API Pinecone est valide",
          "Vérifiez que votre clé API a les permissions nécessaires pour cet index",
          "Régénérez votre clé API Pinecone si nécessaire"
        ];
      } else {
        suggestedActions = [
          "Vérifiez la configuration de l'environnement et de l'index",
          "Vérifiez que l'index est actif et n'est pas en pause",
          "Contactez le support Pinecone si le problème persiste"
        ];
      }
      
      return {
        success: false,
        error: `Erreur API Pinecone (${response.status}): ${errorText}`,
        details: {
          apiKeyStatus: 'invalid',
          environment: PINECONE_ENVIRONMENT,
          index: PINECONE_INDEX,
          httpStatus: response.status,
          connectionError: errorText,
          suggestions: suggestedActions
        }
      };
    }
    
    // Analyser la réponse
    const data = await response.json();
    console.log("Réponse de Pinecone:", data);
    
    // Succès
    return {
      success: true,
      details: {
        environment: PINECONE_ENVIRONMENT,
        index: PINECONE_INDEX,
        serverVersion: response.headers.get('server'),
        dimension: data.dimension,
        count: data.totalVectorCount,
        namespaces: Object.keys(data.namespaces || {})
      }
    };
  } catch (error) {
    console.error("Erreur lors du test de connexion à Pinecone:", error);
    
    return {
      success: false,
      error: `Erreur de connexion: ${error instanceof Error ? error.message : String(error)}`,
      details: {
        environment: PINECONE_ENVIRONMENT,
        index: PINECONE_INDEX,
        connectionError: error instanceof Error ? error.message : String(error),
        suggestions: [
          "Vérifiez votre connexion Internet",
          "Vérifiez que les paramètres d'environnement et d'index sont corrects",
          "Vérifiez que l'URL Pinecone est accessible"
        ]
      }
    };
  }
}

// Check if required API keys are present
export function checkApiKeys() {
  console.log("Vérification des clés API...");
  const missingKeys = [];
  
  if (!PINECONE_API_KEY) {
    missingKeys.push("PINECONE_API_KEY");
  }
  
  if (!OPENAI_API_KEY) {
    missingKeys.push("OPENAI_API_KEY");
  }
  
  console.log(`Clés manquantes: ${missingKeys.length > 0 ? missingKeys.join(", ") : "Aucune"}`);
  
  return {
    missingKeys,
    error: missingKeys.length > 0 
      ? `Clés API manquantes: ${missingKeys.join(", ")}` 
      : null
  };
}
