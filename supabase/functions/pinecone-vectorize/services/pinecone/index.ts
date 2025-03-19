import { PINECONE_API_KEY, getPineconeUrl, PINECONE_INDEX, PINECONE_NAMESPACE } from "../../config.ts";
import { PINECONE_HEADERS, getPineconeOperationUrl } from "./config.ts";
import { generateEmbeddingWithOpenAI } from "../openai.ts";

/**
 * Teste la connexion à Pinecone
 * @returns Un objet indiquant si la connexion a réussi
 */
export async function testPineconeConnection(): Promise<any> {
  try {
    console.log("Test de connexion à Pinecone...");
    
    // Vérification de la clé API
    if (!PINECONE_API_KEY) {
      console.error("Clé API Pinecone manquante");
      return {
        success: false,
        message: "Clé API Pinecone manquante",
        timestamp: new Date().toISOString()
      };
    }
    
    // Récupération de l'URL Pinecone
    const pineconeUrl = getPineconeUrl();
    
    if (!pineconeUrl || pineconeUrl.trim() === '') {
      console.error("URL Pinecone manquante ou vide");
      return {
        success: false,
        message: "URL Pinecone non configurée",
        error: "URL Pinecone manquante ou vide",
        timestamp: new Date().toISOString(),
        configuredUrl: pineconeUrl
      };
    }
    
    if (!pineconeUrl.includes("pinecone.io") && !pineconeUrl.startsWith("http")) {
      console.error(`URL Pinecone invalide: ${pineconeUrl}`);
      return {
        success: false,
        message: "Format d'URL Pinecone invalide",
        error: `URL Pinecone invalide: ${pineconeUrl}`,
        timestamp: new Date().toISOString(),
        configuredUrl: pineconeUrl
      };
    }
    
    console.log(`Test de connexion avec l'URL: ${pineconeUrl}`);
    
    // Construction de l'URL complète
    const normalizedUrl = pineconeUrl.endsWith('/') ? pineconeUrl : `${pineconeUrl}/`;
    let testUrl;
    
    if (PINECONE_INDEX) {
      // Si un index est configuré, on utilise la nouvelle API Pinecone
      testUrl = `${normalizedUrl}databases`;
    } else {
      // Sinon, on essaie un endpoint générique
      testUrl = normalizedUrl;
    }
    
    console.log(`URL de test complète: ${testUrl}`);
    
    try {
      // Test simple avec HEAD pour vérifier si le domaine est valide
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: PINECONE_HEADERS
      });
      
      console.log(`Réponse du test: ${response.status} ${response.statusText}`);
      
      // Traiter la réponse
      if (response.ok) {
        return {
          success: true,
          message: "Connexion Pinecone réussie",
          status: response.status,
          timestamp: new Date().toISOString(),
          url: testUrl
        };
      } else {
        const errorText = await response.text();
        return {
          success: false,
          message: `Connexion échouée: ${response.status} ${response.statusText}`,
          error: errorText,
          status: response.status,
          timestamp: new Date().toISOString(),
          url: testUrl
        };
      }
    } catch (fetchError) {
      console.error("Erreur de fetch:", fetchError);
      return {
        success: false,
        message: "Exception lors de la connexion à Pinecone",
        error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        timestamp: new Date().toISOString(),
        url: testUrl
      };
    }
  } catch (error) {
    console.error("Erreur lors du test de connexion Pinecone:", error);
    return {
      success: false,
      message: `Exception: ${error instanceof Error ? error.message : String(error)}`,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Index un document dans Pinecone
 * @param id ID du document
 * @param content Contenu du document
 * @param metadata Métadonnées du document
 * @returns Résultat de l'opération d'indexation
 */
export async function indexDocumentInPinecone(
  id: string,
  content: string,
  metadata: Record<string, any>
): Promise<any> {
  try {
    console.log(`Indexation du document ${id} dans Pinecone...`);
    
    // Génération d'embedding pour le document
    const embedding = await generateEmbeddingWithOpenAI(content);
    
    // Préparation du vecteur pour Pinecone
    const vector = {
      id,
      values: embedding,
      metadata: {
        ...metadata,
        text: content.substring(0, 1000) // Tronquer à 1000 caractères pour les métadonnées
      }
    };
    
    // Construction de l'URL d'upsert
    const upsertUrl = getPineconeOperationUrl('upsert');
    console.log(`URL d'upsert: ${upsertUrl}`);
    
    // Préparation du corps de la requête
    const requestBody = JSON.stringify({
      vectors: [vector],
      namespace: PINECONE_NAMESPACE
    });
    
    // Envoi de la requête à Pinecone
    const response = await fetch(upsertUrl, {
      method: 'POST',
      headers: PINECONE_HEADERS,
      body: requestBody
    });
    
    // Traitement de la réponse
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur Pinecone pour upsert (${response.status}): ${errorText}`);
      throw new Error(`Erreur Pinecone: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`Document ${id} indexé avec succès:`, result);
    
    return {
      success: true,
      documentId: id,
      result,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Erreur lors de l'indexation du document ${id}:`, error);
    return {
      success: false,
      documentId: id,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
}
