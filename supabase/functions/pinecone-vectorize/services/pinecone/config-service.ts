
/**
 * Service de gestion de la configuration Pinecone
 */

import { validateConfig, getPineconeIndex } from "../../config.ts";
import { logMessage } from "../../utils/logging.ts";

/**
 * Récupère la configuration Pinecone actuelle et effectue des vérifications
 * @returns La configuration Pinecone avec détails de diagnostic
 */
export async function getPineconeConfig(): Promise<any> {
  try {
    console.log(`[${new Date().toISOString()}] Récupération de la configuration Pinecone...`);
    
    // Validation de la configuration
    const configValidation = validateConfig();
    
    console.log(`Résultat de la validation: ${JSON.stringify(configValidation)}`);
    
    // Informations sur l'environnement et les clés API
    const apiKeysInfo = {
      hasPineconeKey: Boolean(Deno.env.get("PINECONE_API_KEY")),
      pineconeKeyLength: Deno.env.get("PINECONE_API_KEY") ? Deno.env.get("PINECONE_API_KEY")!.length : 0,
      openAiKey: Boolean(Deno.env.get("OPENAI_API_KEY")),
    };
    
    console.log(`API keys disponibles: Pinecone: ${apiKeysInfo.hasPineconeKey ? "Oui" : "Non"}, OpenAI: ${apiKeysInfo.openAiKey ? "Oui" : "Non"}`);
    
    // Vérifier l'URL Pinecone
    const pineconeUrl = Deno.env.get("PINECONE_BASE_URL") || "";
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
