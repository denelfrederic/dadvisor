
// Mise à jour de la fonction edge Pinecone pour ajouter la gestion de la mise à jour de configuration

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { logMessage, logError } from "./utils/logging.ts";
import { corsedResponse } from "./utils/response.ts";

// Import des gestionnaires d'action
import { handleVectorizeAction } from "./handlers/vectorizeHandler.ts";
import { handleQueryAction } from "./handlers/queryHandler.ts";
import { handleTestConnectionAction } from "./handlers/testConnectionHandler.ts";
import { handleConfigAction } from "./handlers/configHandler.ts";
import { handleSearchKnowledgeBaseAction } from "./handlers/searchKnowledgeBaseHandler.ts";
import { handleUpdateConfigAction } from "./handlers/updateConfigHandler.ts";

serve(async (req) => {
  try {
    // Gérer les requêtes preflight OPTIONS
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    // Vérifier si la requête est POST
    if (req.method !== "POST") {
      return corsedResponse({
        success: false,
        error: `Méthode ${req.method} non supportée`
      }, 405);
    }

    // Récupérer les données de la requête
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      return corsedResponse({
        success: false,
        error: "Format de requête invalide"
      }, 400);
    }

    // Journal de la requête reçue (niveau debug)
    logMessage(`Requête reçue: ${JSON.stringify(requestData)}`, "debug");

    // Vérifier que l'action est spécifiée
    if (!requestData.action) {
      return corsedResponse({
        success: false,
        error: "Paramètre 'action' requis"
      }, 400);
    }

    // Traitement des différentes actions
    switch (requestData.action) {
      case "vectorize":
        // Vectorisation de document
        return await handleVectorizeAction(requestData);

      case "query":
        // Recherche similaire
        return await handleQueryAction(requestData);

      case "test-connection":
        // Test de connexion à Pinecone
        return await handleTestConnectionAction(requestData);

      case "config":
        // Récupération de la configuration
        return await handleConfigAction();
        
      case "search-knowledge-base":
        // Recherche dans la base de connaissances
        return await handleSearchKnowledgeBaseAction(requestData);
        
      case "update-config":
        // Mise à jour de la configuration
        return await handleUpdateConfigAction(requestData);

      default:
        // Action non reconnue
        return corsedResponse({
          success: false,
          error: `Action '${requestData.action}' non reconnue`
        }, 400);
    }
  } catch (error) {
    // Journaliser et renvoyer les erreurs non gérées
    const errorMessage = logError("Erreur non gérée dans la fonction edge", error);
    return corsedResponse({
      success: false,
      error: errorMessage
    }, 500);
  }
});
