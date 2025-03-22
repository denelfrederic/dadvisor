
// Point d'entrée de la fonction edge Pinecone

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { logMessage, logError } from "./utils/logging.ts";
import { createErrorResponse } from "./utils/response.ts";

// Configuration du timeout pour la fonction (30 secondes)
const FUNCTION_TIMEOUT = 30000;

serve(async (req) => {
  try {
    // Gérer les requêtes OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Créer un AbortController pour gérer le timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FUNCTION_TIMEOUT);

    try {
      // Importer dynamiquement le routeur pour éviter des problèmes de chargement
      const { routeRequest } = await import("./router.ts");
      
      logMessage(`Requête reçue: ${req.method} ${new URL(req.url).pathname}`, 'info');
      
      // Utiliser le routeur pour traiter la requête
      const response = await routeRequest(req);
      
      // Annuler le timeout si la requête a réussi
      clearTimeout(timeoutId);
      
      return response;
    } catch (routerError) {
      // Annuler le timeout
      clearTimeout(timeoutId);
      
      // Vérifier si l'erreur est due à un timeout
      if (controller.signal.aborted) {
        logError("La requête a expiré (timeout de la fonction edge)", new Error("Function timeout"));
        return createErrorResponse({
          message: "La fonction edge a expiré après 30 secondes",
          status: 504,
          details: "Le traitement a pris trop de temps. Vérifiez les logs pour plus d'informations."
        });
      }
      
      // Logger et retourner l'erreur du routeur
      logError(`Erreur dans le routeur: ${routerError instanceof Error ? routerError.message : String(routerError)}`, routerError);
      
      return createErrorResponse({
        message: `Erreur lors du traitement de la requête: ${routerError instanceof Error ? routerError.message : String(routerError)}`,
        status: 500,
        details: routerError instanceof Error ? routerError.stack : null
      });
    }
  } catch (error) {
    // Logger et retourner toute erreur non gérée
    logError(`Erreur non gérée dans la fonction edge: ${error instanceof Error ? error.message : String(error)}`, error);
    
    return createErrorResponse({
      message: `Erreur interne du serveur: ${error instanceof Error ? error.message : String(error)}`,
      status: 500,
      details: error instanceof Error ? error.stack : null
    });
  }
});
