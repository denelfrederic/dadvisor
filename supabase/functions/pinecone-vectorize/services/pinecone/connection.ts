
/**
 * Service de gestion des connexions à Pinecone
 */

import { PINECONE_API_KEY, getPineconeUrl, PINECONE_INDEX, PINECONE_NAMESPACE } from "../../config.ts";
import { PINECONE_HEADERS, getPineconeOperationUrl, detectPineconeUrlType } from "./config.ts";
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
      
      // Essayer aussi avec un endpoint vectors/upsert pour tester l'opération qui échoue
      testUrls.push(`${normalizedUrl}vectors/upsert`);
      
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
            namespace: PINECONE_NAMESPACE,
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
        namespace: PINECONE_NAMESPACE,
        lastError: lastError,
        lastResponse: lastResponse,
        suggestedActions: [
          "Vérifiez que l'URL Pinecone configurée est correcte",
          "Vérifiez que le nom de l'index est correct",
          "Vérifiez que la clé API est valide",
          "Vérifiez que votre index Pinecone est bien actif (non en pause)"
        ]
      };
    }
  } catch (error) {
    console.error("Exception lors du test de connexion à Pinecone:", error);
    return {
      success: false,
      message: `Exception lors du test de connexion à Pinecone: ${error instanceof Error ? error.message : String(error)}`,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
}
