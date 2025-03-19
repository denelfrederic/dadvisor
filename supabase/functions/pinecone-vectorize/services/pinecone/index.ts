
import { PINECONE_API_KEY, getPineconeUrl, PINECONE_INDEX, PINECONE_NAMESPACE } from "../../config.ts";
import { PINECONE_HEADERS, getPineconeOperationUrl, detectPineconeUrlType } from "./config.ts";
import { generateEmbeddingWithOpenAI } from "../openai.ts";
import { logMessage, logError } from "../../utils/logging.ts";

/**
 * Teste la connexion à Pinecone avec différentes variantes d'URL
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
    
    // Détection du type d'API Pinecone
    const apiType = detectPineconeUrlType(normalizedUrl);
    console.log(`Type d'API Pinecone détecté: ${apiType}`);
    
    // Déterminer l'URL de test en fonction du type d'API
    const indexName = PINECONE_INDEX || "dadvisor"; // Utiliser l'index par défaut si non configuré
    console.log(`Utilisation de l'index: ${indexName}`);
    
    // Essayons différentes URL en fonction du type d'API
    const testUrls = [];
    
    if (apiType === 'serverless') {
      // URLs pour API Serverless
      testUrls.push(`${normalizedUrl}`); // URL de base
      testUrls.push(`${normalizedUrl}describe_index_stats`); // Stats d'index (serverless)
    } 
    else if (apiType === 'legacy') {
      // URLs pour API Legacy
      testUrls.push(`${normalizedUrl}`); // URL de base
      testUrls.push(`${normalizedUrl}query`); // Endpoint query (legacy)
    }
    else {
      // Type inconnu, essayer plusieurs formats
      testUrls.push(`${normalizedUrl}`); // URL de base
      testUrls.push(`${normalizedUrl}describe_index_stats`); // Stats d'index (serverless)
      testUrls.push(`${normalizedUrl}query`); // Endpoint query (legacy)
      
      // Essayer aussi avec databases
      if (!normalizedUrl.includes("databases")) {
        testUrls.push(`${normalizedUrl}databases`);
      }
    }
    
    // Essayer chaque URL jusqu'à ce qu'une fonctionne
    let success = false;
    let lastError = null;
    let lastResponse = null;
    let successUrl = null;
    
    for (const testUrl of testUrls) {
      try {
        console.log(`Tentative avec l'URL: ${testUrl}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout
        
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: PINECONE_HEADERS,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log(`Réponse du test pour ${testUrl}: ${response.status} ${response.statusText}`);
        
        // Stocker la dernière réponse
        lastResponse = {
          status: response.status,
          statusText: response.statusText,
          url: testUrl
        };
        
        // Si la réponse est OK, on a trouvé une URL qui fonctionne
        if (response.ok || response.status === 200) {
          success = true;
          successUrl = testUrl;
          
          const responseData = await response.text();
          console.log(`Réponse reçue: ${responseData.substring(0, 100)}...`);
          
          return {
            success: true,
            message: "Connexion Pinecone réussie",
            status: response.status,
            timestamp: new Date().toISOString(),
            url: testUrl,
            apiType: apiType,
            indexName: indexName,
            response: responseData.substring(0, 200)
          };
        } else {
          const errorText = await response.text();
          console.error(`Erreur HTTP pour ${testUrl}: ${response.status} ${response.statusText}`);
          console.error(`Corps de l'erreur: ${errorText}`);
          
          // Stocker la dernière erreur
          lastError = {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            url: testUrl
          };
        }
      } catch (fetchError) {
        console.error(`Erreur lors de la requête à ${testUrl}:`, fetchError);
        
        // Stocker la dernière erreur
        const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
        lastError = {
          error: errorMessage,
          url: testUrl
        };
      }
    }
    
    // Si aucune URL n'a fonctionné, retourner la dernière erreur
    if (!success) {
      let errorMessage = "Toutes les tentatives de connexion à Pinecone ont échoué";
      
      // Vérifier si c'est une erreur 404 (URL incorrecte ou index inexistant)
      if (lastResponse && lastResponse.status === 404) {
        errorMessage = `Erreur 404: L'URL Pinecone ou l'index '${indexName}' n'existe pas. Vérifiez les points suivants:\n`;
        errorMessage += "1. Vérifiez que l'URL contient bien le nom de votre index et la région correcte\n";
        errorMessage += "2. Assurez-vous que votre index est bien créé dans la console Pinecone\n";
        errorMessage += "3. Si vous utilisez un plan gratuit, vérifiez que votre index n'est pas en pause\n";
        errorMessage += "4. Essayez de récupérer une nouvelle URL depuis la console Pinecone";
      }
      // Vérifier si c'est une erreur 403 (problème d'accès ou de clé API)
      else if (lastResponse && lastResponse.status === 403) {
        errorMessage = "Erreur 403: Accès refusé. Vérifiez votre clé API Pinecone ou les permissions de votre compte.";
        errorMessage += " Si vous utilisez un plan gratuit, votre index pourrait être en pause.";
      }
      
      return {
        success: false,
        message: errorMessage,
        error: lastError ? JSON.stringify(lastError) : "Erreur inconnue",
        status: lastResponse ? lastResponse.status : null,
        timestamp: new Date().toISOString(),
        testedUrls: testUrls,
        apiType: apiType,
        indexName: indexName,
        lastError: lastError,
        lastResponse: lastResponse,
        recommendedAction: "Vérifiez votre URL Pinecone dans la console Pinecone. L'URL doit inclure le nom de votre index et la région correcte."
      };
    }
    
    // Ce code ne devrait jamais être atteint si tout va bien, mais au cas où
    return {
      success: true,
      message: "Connexion Pinecone réussie (fallback)",
      timestamp: new Date().toISOString(),
      url: successUrl,
      apiType: apiType,
      indexName: indexName
    };
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
