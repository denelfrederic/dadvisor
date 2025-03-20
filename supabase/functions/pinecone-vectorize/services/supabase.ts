
/**
 * Service de connexion à Supabase pour les edge functions
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { logMessage } from "../utils/logging.ts";

// Variables d'environnement pour Supabase
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Initialiser le client Supabase si les variables sont disponibles
export const supabaseClient = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Vérifier l'état de la connexion Supabase
export function checkSupabaseConnection() {
  if (!SUPABASE_URL) {
    logMessage("URL Supabase non configurée", 'error');
    return { success: false, error: "SUPABASE_URL manquante" };
  }
  
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    logMessage("Clé de service Supabase non configurée", 'error');
    return { success: false, error: "SUPABASE_SERVICE_ROLE_KEY manquante" };
  }
  
  if (!supabaseClient) {
    logMessage("Client Supabase non initialisé", 'error');
    return { success: false, error: "Client Supabase non initialisé" };
  }
  
  return { success: true };
}
