
import { corsHeaders } from "./cors.ts";

/**
 * Crée une réponse avec les en-têtes CORS
 * @param response Données de la réponse
 * @param status Code de statut HTTP
 * @returns Réponse formatée avec CORS
 */
export const corsedResponse = (response: any, status = 200) => {
  return new Response(JSON.stringify(response), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};
