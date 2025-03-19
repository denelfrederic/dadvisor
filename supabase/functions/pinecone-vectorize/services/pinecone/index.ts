
import { PINECONE_API_KEY, getPineconeUrl, PINECONE_INDEX, PINECONE_NAMESPACE } from "../../config.ts";
import { PINECONE_HEADERS, getPineconeOperationUrl } from "./config.ts";
import { generateEmbeddingWithOpenAI } from "../openai.ts";
import { logMessage, logError } from "../../utils/logging.ts";

/**
 * Teste la connexion à Pinecone
 * @returns Un objet indiquant si la connexion a réussi
 */
export async function testPineconeConnection(): Promise<any> {
  try {
    console.log(`[${new Date().toISOString()}] Test de connexion à Pinecone...`);
    
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
    console.log(`URL Pinecone utilisée: ${pineconeUrl}`);
    
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
    
    // Déterminer l'URL de test
    const indexName = PINECONE_INDEX || "dadvisor"; // Utiliser l'index par défaut si non configuré
    console.log(`Utilisation de l'index: ${indexName}`);
    
    if (indexName) {
      // Si un index est configuré, on utilise la nouvelle API Pinecone
      testUrl = `${normalizedUrl}databases`;
    } else {
      // Sinon, on essaie un endpoint générique
      testUrl = normalizedUrl;
    }
    
    console.log(`URL de test complète: ${testUrl}`);
    console.log(`En-têtes utilisés: ${JSON.stringify({
      ...PINECONE_HEADERS,
      'Api-Key': 'XXXXX' // Masquer la clé API pour la sécurité
    })}`);
    
    try {
      // Test simple avec HEAD pour vérifier si le domaine est valide
      console.log(`Envoi de la requête de test à ${testUrl}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: PINECONE_HEADERS,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log(`Réponse du test: ${response.status} ${response.statusText}`);
      
      // Traiter la réponse
      if (response.ok) {
        const responseData = await response.text();
        console.log(`Réponse reçue: ${responseData.substring(0, 100)}...`);
        
        return {
          success: true,
          message: "Connexion Pinecone réussie",
          status: response.status,
          timestamp: new Date().toISOString(),
          url: testUrl,
          indexName: indexName,
          response: responseData.substring(0, 200)
        };
      } else {
        const errorText = await response.text();
        console.error(`Erreur HTTP: ${response.status} ${response.statusText}`);
        console.error(`Corps de l'erreur: ${errorText}`);
        
        return {
          success: false,
          message: `Connexion échouée: ${response.status} ${response.statusText}`,
          error: errorText,
          status: response.status,
          timestamp: new Date().toISOString(),
          url: testUrl,
          indexName: indexName,
          headers: Object.keys(PINECONE_HEADERS) // Liste des en-têtes utilisés sans valeurs
        };
      }
    } catch (fetchError) {
      console.error("Erreur de fetch:", fetchError);
      
      // Vérifier si c'est une erreur de timeout
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      const isTimeout = errorMessage.includes("abort") || errorMessage.includes("timeout");
      
      return {
        success: false,
        message: isTimeout ? 
          "La connexion a expiré, le serveur Pinecone n'a pas répondu à temps" : 
          "Exception lors de la connexion à Pinecone",
        error: errorMessage,
        timestamp: new Date().toISOString(),
        url: testUrl,
        indexName: indexName
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
 * Récupère la configuration Pinecone actuelle et effectue des vérifications
 * @returns La configuration Pinecone avec détails de diagnostic
 */
export async function getPineconeConfig(): Promise<any> {
  try {
    console.log(`[${new Date().toISOString()}] Récupération de la configuration Pinecone...`);
    
    // Validation de la configuration
    const { validateConfig } = await import("../../config.ts");
    const configValidation = validateConfig();
    
    console.log(`Résultat de la validation: ${JSON.stringify(configValidation)}`);
    
    // Informations sur l'environnement et les clés API
    const apiKeysInfo = {
      hasPineconeKey: Boolean(PINECONE_API_KEY),
      pineconeKeyLength: PINECONE_API_KEY ? PINECONE_API_KEY.length : 0,
      openAiKey: Boolean(Deno.env.get("OPENAI_API_KEY")),
    };
    
    console.log(`API keys disponibles: Pinecone: ${apiKeysInfo.hasPineconeKey ? "Oui" : "Non"}, OpenAI: ${apiKeysInfo.openAiKey ? "Oui" : "Non"}`);
    
    // Vérifier l'URL Pinecone
    const pineconeUrl = getPineconeUrl();
    let urlStatus = "non configurée";
    
    if (pineconeUrl) {
      if (pineconeUrl.includes("pinecone.io")) {
        urlStatus = "format valide";
      } else {
        urlStatus = "format potentiellement invalide";
      }
    }
    
    return {
      ...configValidation,
      apiStatus: apiKeysInfo,
      urlCheck: {
        url: pineconeUrl,
        status: urlStatus
      },
      environmentCheck: {
        denoVersion: Deno.version.deno,
        v8Version: Deno.version.v8,
        typescript: Deno.version.typescript,
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la configuration Pinecone:", error);
    return {
      success: false,
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
    console.log(`Envoi de la requête d'upsert à ${upsertUrl}...`);
    
    const response = await fetch(upsertUrl, {
      method: 'POST',
      headers: PINECONE_HEADERS,
      body: requestBody
    });
    
    // Traitement de la réponse
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur Pinecone pour upsert (${response.status}): ${errorText}`);
      
      // Diagnostic spécifique pour les erreurs courantes
      if (response.status === 403) {
        console.error("ERREUR 403: Accès refusé à Pinecone. Vérifiez votre clé API et les permissions.");
      } else if (response.status === 404) {
        console.error("ERREUR 404: Index Pinecone non trouvé. Vérifiez le nom de l'index dans la configuration.");
      } else if (response.status === 400) {
        console.error("ERREUR 400: Requête invalide. Vérifiez le format de vos données.");
      }
      
      throw new Error(`Erreur Pinecone: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`Document ${id} indexé avec succès:`, result);
    
    // Retourner l'embedding avec le résultat pour stocker dans Supabase également
    return {
      success: true,
      documentId: id,
      result,
      embedding: embedding,
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
