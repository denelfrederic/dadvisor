
/**
 * Service de connexion à Supabase pour les edge functions
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { logMessage } from "../utils/logging.ts";

// Variables d'environnement pour Supabase
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// État de diagnostic pour aider au dépannage
const diagnosticState = {
  url: {
    isDefined: Boolean(SUPABASE_URL),
    length: SUPABASE_URL ? SUPABASE_URL.length : 0,
    isValid: SUPABASE_URL ? SUPABASE_URL.includes('supabase.co') : false
  },
  key: {
    isDefined: Boolean(SUPABASE_SERVICE_ROLE_KEY),
    length: SUPABASE_SERVICE_ROLE_KEY ? SUPABASE_SERVICE_ROLE_KEY.length : 0,
    maskedValue: SUPABASE_SERVICE_ROLE_KEY ? 
      `${SUPABASE_SERVICE_ROLE_KEY.substring(0, 3)}...${SUPABASE_SERVICE_ROLE_KEY.substring(SUPABASE_SERVICE_ROLE_KEY.length - 3)}` : 
      'non définie'
  }
};

// Initialiser le client Supabase avec vérification des variables d'environnement
let supabaseClient = null;

try {
  if (!SUPABASE_URL || SUPABASE_URL.trim() === "") {
    logMessage("ERREUR CRITIQUE: SUPABASE_URL est manquante ou vide", 'error');
    console.error("ERREUR CRITIQUE: SUPABASE_URL est manquante ou vide", diagnosticState);
    throw new Error("SUPABASE_URL non définie ou vide");
  }
  
  if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY.trim() === "") {
    logMessage("ERREUR CRITIQUE: SUPABASE_SERVICE_ROLE_KEY est manquante ou vide", 'error');
    console.error("ERREUR CRITIQUE: SUPABASE_SERVICE_ROLE_KEY est manquante ou vide", diagnosticState);
    throw new Error("SUPABASE_SERVICE_ROLE_KEY non définie ou vide");
  }
  
  // Créer le client uniquement si les deux variables sont disponibles et non vides
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  logMessage(`Client Supabase initialisé avec succès pour ${SUPABASE_URL}`, 'info');
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  logMessage(`Échec d'initialisation du client Supabase: ${errorMessage}`, 'error');
  console.error("ERREUR CRITIQUE: Impossible d'initialiser le client Supabase:", errorMessage, diagnosticState);
}

// Export du client Supabase
export const supabase = supabaseClient;

// Vérifier l'état de la connexion Supabase avec détails de diagnostic
export function checkSupabaseConnection() {
  const diagnostics = {
    SUPABASE_URL_defined: Boolean(SUPABASE_URL),
    SUPABASE_URL_length: SUPABASE_URL ? SUPABASE_URL.length : 0,
    SUPABASE_URL_valid: SUPABASE_URL ? SUPABASE_URL.includes('supabase.co') : false,
    SUPABASE_SERVICE_ROLE_KEY_defined: Boolean(SUPABASE_SERVICE_ROLE_KEY),
    SUPABASE_SERVICE_ROLE_KEY_masked: SUPABASE_SERVICE_ROLE_KEY ? 
      `${SUPABASE_SERVICE_ROLE_KEY.substring(0, 3)}...${SUPABASE_SERVICE_ROLE_KEY.substring(SUPABASE_SERVICE_ROLE_KEY.length - 3)}` : 
      'non définie',
    clientInitialized: Boolean(supabaseClient)
  };
  
  if (!SUPABASE_URL) {
    logMessage("URL Supabase non configurée", 'error');
    return { success: false, error: "SUPABASE_URL manquante", diagnostics };
  }
  
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    logMessage("Clé de service Supabase non configurée", 'error');
    return { success: false, error: "SUPABASE_SERVICE_ROLE_KEY manquante", diagnostics };
  }
  
  if (!supabaseClient) {
    logMessage("Client Supabase non initialisé", 'error');
    return { success: false, error: "Client Supabase non initialisé", diagnostics };
  }
  
  return { success: true, diagnostics };
}
