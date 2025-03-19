
// Configuration pour l'edge function pinecone-vectorize

// API keys et URLs
export const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
export const PINECONE_API_KEY = Deno.env.get("PINECONE_API_KEY") || "";
export const PINECONE_BASE_URL = Deno.env.get("PINECONE_BASE_URL") || "";
export const ALTERNATIVE_PINECONE_URL = Deno.env.get("ALTERNATIVE_PINECONE_URL") || "";
export const PINECONE_INDEX = Deno.env.get("PINECONE_INDEX") || "";

// URL par défaut pour Pinecone si aucune n'est configurée
// Cette URL devrait être remplacée par une URL réelle dans les variables d'environnement
export const DEFAULT_PINECONE_URL = "https://demo-index-xxxx.svc.pinecone.io/";

// Namespace par défaut pour Pinecone
export const PINECONE_NAMESPACE = "documents";

// Timeout pour les requêtes (30 secondes)
export const REQUEST_TIMEOUT = 30000;

/**
 * Valide la configuration de l'application
 * @returns Objet contenant le statut de validation et les avertissements
 */
export function validateConfig() {
  const warnings = [];
  
  if (!PINECONE_API_KEY) {
    warnings.push("PINECONE_API_KEY manquante");
  }
  
  if (!PINECONE_BASE_URL) {
    warnings.push("PINECONE_BASE_URL manquante");
  }
  
  if (!OPENAI_API_KEY) {
    warnings.push("OPENAI_API_KEY manquante");
  }
  
  // Valider le format de l'URL Pinecone
  if (PINECONE_BASE_URL && !PINECONE_BASE_URL.includes("pinecone")) {
    warnings.push("PINECONE_BASE_URL semble invalide (doit contenir 'pinecone')");
  }
  
  // Retourner le résultat de la validation
  return {
    valid: warnings.length === 0,
    warnings,
    timestamp: new Date().toISOString(),
    config: {
      hasPineconeKey: Boolean(PINECONE_API_KEY),
      hasPineconeUrl: Boolean(PINECONE_BASE_URL),
      hasOpenAIKey: Boolean(OPENAI_API_KEY),
      hasAlternativeUrl: Boolean(ALTERNATIVE_PINECONE_URL),
      hasPineconeIndex: Boolean(PINECONE_INDEX)
    }
  };
}

/**
 * Teste la connexion à Pinecone
 * @returns Un objet indiquant si la connexion a réussi
 */
export async function testPineconeConnection(): Promise<any> {
  // Note: Cette fonction est maintenant définie dans services/pinecone/index.ts
  // Cette redirection est maintenue pour compatibilité
  const { testPineconeConnection: tester } = await import("./services/pinecone/index.ts");
  return await tester();
}
