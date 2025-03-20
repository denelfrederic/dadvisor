
/**
 * Gestionnaire pour les requêtes de configuration
 */

import { corsedResponse } from "../utils/response.ts";
import { logMessage, logError } from "../utils/logging.ts";
import { validateConfig } from "../config.ts";
import { testPineconeConnection } from "../services/pinecone/connection.ts";

/**
 * Gestionnaire pour l'action de récupération de configuration
 */
export async function handleConfigAction() {
  try {
    logMessage("Récupération de la configuration", 'info');
    
    // Vérifier la configuration
    const configCheck = validateConfig();
    
    // Tester la connexion à Pinecone
    let connectionTest;
    try {
      connectionTest = await testPineconeConnection();
    } catch (error) {
      logError("Erreur lors du test de connexion Pinecone", error);
      connectionTest = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
    
    // Récupérer les variables d'environnement importantes (sans exposer les valeurs)
    const envStatus = {
      OPENAI_API_KEY: Boolean(Deno.env.get("OPENAI_API_KEY")),
      PINECONE_API_KEY: Boolean(Deno.env.get("PINECONE_API_KEY")),
      PINECONE_BASE_URL: Boolean(Deno.env.get("PINECONE_BASE_URL")),
      ALTERNATIVE_PINECONE_URL: Boolean(Deno.env.get("ALTERNATIVE_PINECONE_URL")),
      PINECONE_INDEX: Boolean(Deno.env.get("PINECONE_INDEX"))
    };
    
    // Vérifier le format des URLs (sans exposer les valeurs complètes)
    const urlChecks = {};
    for (const urlKey of ["PINECONE_BASE_URL", "ALTERNATIVE_PINECONE_URL"]) {
      const url = Deno.env.get(urlKey);
      if (url) {
        urlChecks[urlKey] = {
          format: url.startsWith("http") ? "valide" : "invalide",
          containsPinecone: url.includes("pinecone.io") ? "oui" : "non",
          length: url.length
        };
      } else {
        urlChecks[urlKey] = null;
      }
    }
    
    // Informations sur l'environnement d'exécution
    const runtimeInfo = {
      denoVersion: Deno.version.deno,
      v8Version: Deno.version.v8,
      typescriptVersion: Deno.version.typescript
    };
    
    return corsedResponse({
      ...configCheck,
      connectionTest,
      envStatus,
      urlChecks,
      runtimeInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMsg = logError("Erreur lors de la récupération de la configuration", error);
    return corsedResponse({
      success: false,
      error: errorMsg
    }, 500);
  }
}
