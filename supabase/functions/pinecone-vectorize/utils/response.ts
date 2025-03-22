
import { corsHeaders } from "./cors.ts";

/**
 * Crée une réponse avec les en-têtes CORS
 * @param response Données de la réponse
 * @param status Code de statut HTTP
 * @returns Réponse formatée avec CORS
 */
export const corsedResponse = (response: any, status = 200) => {
  try {
    return new Response(JSON.stringify(response), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erreur lors de la création de la réponse:", error);
    return new Response(JSON.stringify({ 
      error: `Erreur lors de la création de la réponse: ${error instanceof Error ? error.message : String(error)}`,
      originalData: typeof response
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};
