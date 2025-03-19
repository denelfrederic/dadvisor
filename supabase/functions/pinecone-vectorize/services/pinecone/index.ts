
// Point d'entrée pour les services Pinecone
// Exporte toutes les fonctions du service Pinecone

export { validatePineconeConfig } from "./config.ts";
export { upsertToPinecone } from "./upsert.ts";
export { queryPinecone } from "./query.ts";

// Ajout d'une fonction pour tester la connexion à Pinecone
import { PINECONE_API_KEY, PINECONE_BASE_URL } from "../../config.ts";
import { PINECONE_HEADERS } from "./config.ts";
import { generateEmbeddingWithOpenAI } from "../openai.ts";

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

/**
 * Récupère la configuration Pinecone
 * @returns La configuration Pinecone
 */
export async function getPineconeConfig(): Promise<any> {
  return {
    success: true,
    pineconeApiKey: Boolean(PINECONE_API_KEY),
    pineconeUrl: PINECONE_BASE_URL,
    timestamp: new Date().toISOString()
  };
}

/**
 * Indexe un document dans Pinecone
 * @param documentId L'ID du document
 * @param documentContent Le contenu du document
 * @param documentTitle Le titre du document
 * @param documentType Le type du document
 * @returns Un objet indiquant si l'indexation a réussi
 */
export async function indexDocumentInPinecone(
  documentId: string,
  documentContent: string,
  documentTitle: string,
  documentType: string
): Promise<{ success: boolean; message?: string; error?: string; embedding?: number[] }> {
  try {
    console.log(`Indexation du document ${documentId} (${documentTitle}) dans Pinecone...`);
    
    if (!documentContent || documentContent.trim() === '') {
      return { success: false, error: "Le contenu du document est vide" };
    }
    
    // Générer l'embedding via OpenAI
    console.log("Génération de l'embedding via OpenAI...");
    const embedding = await generateEmbeddingWithOpenAI(documentContent);
    
    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
      return { success: false, error: "Échec de la génération de l'embedding" };
    }
    
    console.log(`Embedding généré avec succès (${embedding.length} dimensions)`);
    
    // Préparer les métadonnées
    const metadata = {
      title: documentTitle || "Sans titre",
      type: documentType || "text/plain",
      source: "application",
      timestamp: new Date().toISOString()
    };
    
    // Upserter dans Pinecone
    console.log("Insertion dans Pinecone...");
    const upsertResult = await upsertToPinecone(documentId, embedding, metadata);
    
    if (!upsertResult.success) {
      return { 
        success: false, 
        error: upsertResult.error || "Échec de l'insertion dans Pinecone"
      };
    }
    
    console.log("Document indexé avec succès dans Pinecone");
    
    return { 
      success: true, 
      message: "Document indexé avec succès",
      embedding: embedding
    };
  } catch (error) {
    console.error("Erreur lors de l'indexation du document:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
