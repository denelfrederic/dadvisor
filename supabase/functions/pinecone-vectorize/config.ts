
// Configuration pour l'edge function pinecone-vectorize

// API keys et URLs
export const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
export const PINECONE_API_KEY = Deno.env.get("PINECONE_API_KEY") || "";
export const PINECONE_BASE_URL = Deno.env.get("PINECONE_BASE_URL") || "";
export const ALTERNATIVE_PINECONE_URL = Deno.env.get("ALTERNATIVE_PINECONE_URL") || "";
export const PINECONE_INDEX = Deno.env.get("PINECONE_INDEX") || "";

// URL par défaut pour Pinecone si aucune n'est configurée
// Cette URL est utilisée uniquement comme exemple et devrait être remplacée par une URL réelle
export const DEFAULT_PINECONE_URL = "https://YOUR-INDEX-NAME-REGION.svc.pinecone.io/";

// Namespace par défaut pour Pinecone
export const PINECONE_NAMESPACE = "documents";

// Timeout pour les requêtes (30 secondes)
export const REQUEST_TIMEOUT = 30000;

/**
 * Obtient l'URL Pinecone à utiliser en prenant en compte les différentes options
 * @returns L'URL Pinecone à utiliser, avec une préférence pour l'URL principale puis l'alternative
 */
export function getPineconeUrl(): string {
  if (PINECONE_BASE_URL && PINECONE_BASE_URL.trim() !== "") {
    console.log(`Utilisation de l'URL Pinecone principale: ${PINECONE_BASE_URL}`);
    return PINECONE_BASE_URL;
  }
  
  if (ALTERNATIVE_PINECONE_URL && ALTERNATIVE_PINECONE_URL.trim() !== "") {
    console.log(`URL principale non disponible, utilisation de l'URL alternative: ${ALTERNATIVE_PINECONE_URL}`);
    return ALTERNATIVE_PINECONE_URL;
  }
  
  console.warn("Aucune URL Pinecone configurée, tentative d'utilisation de l'URL par défaut");
  return DEFAULT_PINECONE_URL;
}

/**
 * Valide la configuration de l'application
 * @returns Objet contenant le statut de validation et les avertissements
 */
export function validateConfig() {
  const warnings = [];
  
  if (!PINECONE_API_KEY) {
    warnings.push("PINECONE_API_KEY manquante");
  }
  
  // Vérification plus stricte des URLs Pinecone
  let pineconeUrlStatus = "non configurée";
  
  if (PINECONE_BASE_URL) {
    if (PINECONE_BASE_URL.includes("pinecone.io")) {
      pineconeUrlStatus = "valide";
    } else {
      pineconeUrlStatus = "format invalide";
      warnings.push("PINECONE_BASE_URL semble invalide (doit contenir 'pinecone.io')");
    }
  } else {
    warnings.push("PINECONE_BASE_URL manquante");
  }
  
  // Vérifier l'URL alternative si la principale n'est pas valide
  if (pineconeUrlStatus !== "valide" && ALTERNATIVE_PINECONE_URL) {
    if (ALTERNATIVE_PINECONE_URL.includes("pinecone.io")) {
      pineconeUrlStatus = "alternative valide";
    } else {
      warnings.push("ALTERNATIVE_PINECONE_URL semble invalide (doit contenir 'pinecone.io')");
    }
  }
  
  if (!OPENAI_API_KEY) {
    warnings.push("OPENAI_API_KEY manquante");
  }
  
  if (!PINECONE_INDEX) {
    warnings.push("PINECONE_INDEX manquant");
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
      hasPineconeIndex: Boolean(PINECONE_INDEX),
      pineconeUrlStatus,
      effectiveUrl: getPineconeUrl()
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
