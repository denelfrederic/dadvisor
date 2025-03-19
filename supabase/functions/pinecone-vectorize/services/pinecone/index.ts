
// Point d'entrée pour les services Pinecone
// Exporte toutes les fonctions du service Pinecone

export { validatePineconeConfig } from "./config.ts";
export { upsertToPinecone } from "./upsert.ts";
export { queryPinecone } from "./query.ts";

// Ajout d'une fonction pour tester la connexion à Pinecone
import { PINECONE_API_KEY, PINECONE_BASE_URL } from "../../config.ts";
import { PINECONE_HEADERS } from "./config.ts";

/**
 * Teste la connexion à Pinecone
 * @returns Un objet indiquant si la connexion a réussi
 */
export async function testPineconeConnection(): Promise<any> {
  try {
    console.log("Test de connexion à Pinecone...");
    
    if (!PINECONE_API_KEY) {
      return { 
        success: false, 
        message: "Clé API Pinecone manquante", 
        timestamp: new Date().toISOString() 
      };
    }
    
    // Tester avec une requête simple (describeIndex)
    const response = await fetch(`${PINECONE_BASE_URL}`, {
      method: 'GET',
      headers: PINECONE_HEADERS
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`Échec du test de connexion Pinecone (${response.status}): ${responseText}`);
      return { 
        success: false, 
        message: `Échec de connexion: ${response.status} ${responseText}`,
        status: response.status,
        response: responseText,
        timestamp: new Date().toISOString()
      };
    }
    
    // Tenter de parser la réponse
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { text: responseText };
    }
    
    return { 
      success: true, 
      message: "Connexion à Pinecone réussie",
      data: responseData,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Erreur lors du test de connexion:", error);
    return { 
      success: false, 
      message: `Exception: ${error instanceof Error ? error.message : String(error)}`,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
}
