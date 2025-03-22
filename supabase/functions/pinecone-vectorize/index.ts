
// Point d'entrée de la fonction edge Pinecone

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { logMessage } from "./utils/logging.ts";

serve(async (req) => {
  try {
    // Gérer les requêtes OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Importer dynamiquement le routeur pour éviter des problèmes de chargement
    const { routeRequest } = await import("./router.ts");
    
    logMessage(`Requête reçue: ${req.method} ${new URL(req.url).pathname}`, 'info');
    
    // Utiliser le routeur pour traiter la requête
    return await routeRequest(req);
  } catch (error) {
    // Logger et retourner toute erreur non gérée
    console.error(`Erreur non gérée dans la fonction edge: ${error instanceof Error ? error.message : String(error)}`);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Erreur interne du serveur: ${error instanceof Error ? error.message : String(error)}`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
