
// services/supabase.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { logMessage } from "../utils/logging.ts";

// Récupérer les variables d'environnement
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_KEY");

// Vérifier si les variables d'environnement sont définies
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  logMessage("Variables d'environnement SUPABASE_URL ou SUPABASE_SERVICE_KEY non définies", "error");
}

// Créer le client Supabase
export const supabaseClient = createClient(
  SUPABASE_URL || "",
  SUPABASE_SERVICE_KEY || ""
);

/**
 * Vérifie si la connexion à Supabase est fonctionnelle
 */
export async function testSupabaseConnection() {
  try {
    // Effectuer une requête simple pour vérifier la connexion
    const { data, error } = await supabaseClient
      .from('knowledge_entries')
      .select('count')
      .limit(1);
      
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      message: "Connexion à Supabase réussie"
    };
  } catch (error) {
    return {
      success: false,
      message: `Échec de la connexion à Supabase: ${error.message || "Erreur inconnue"}`
    };
  }
}
