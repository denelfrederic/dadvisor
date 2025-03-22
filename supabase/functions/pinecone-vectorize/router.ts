
import { handleVectorize } from "./handlers/vectorizeHandler.ts";
import { handleQuery } from "./handlers/queryHandler.ts";
import { handleConfig } from "./handlers/configHandler.ts";
import { handleTestConnection } from "./handlers/testConnectionHandler.ts";
import { handleUpdateConfig } from "./handlers/updateConfigHandler.ts";
import { handleKnowledgeBase } from "./handlers/knowledgeBaseHandler.ts";
import { handleOpenAI } from "./handlers/openaiHandler.ts";
import { handleSearchKnowledgeBase } from "./handlers/searchKnowledgeBaseHandler.ts";
import { handleListVectors } from "./handlers/listVectorsHandler.ts";
import { corsHeaders } from "./utils/cors.ts";
import { logMessage, logError } from "./utils/logging.ts";
import { createErrorResponse, createSuccessResponse } from "./utils/response.ts";

/**
 * Routeur principal pour les requêtes entrantes
 * @param req La requête HTTP
 * @returns Response avec le résultat de l'action ou une erreur
 */
export async function routeRequest(req: Request): Promise<Response> {
  try {
    // Vérifier si c'est une requête OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Extraire l'action de la requête
    let action;
    let body;
    
    try {
      body = await req.json();
      action = body.action;
      logMessage(`Requête reçue pour l'action: ${action}`, "info");
    } catch (parseError) {
      logError("Erreur lors du parsing du JSON de la requête", parseError);
      return createErrorResponse({
        message: "Format de requête invalide: JSON attendu avec un champ 'action'",
        status: 400
      });
    }
    
    // Router vers le bon handler selon l'action
    try {
      switch (action) {
        case 'vectorize':
          return await handleVectorize(req);
        case 'query':
          return await handleQuery(req);
        case 'config':
          return await handleConfig(req);
        case 'test-connection':
          return await handleTestConnection(req);
        case 'update-config':
          return await handleUpdateConfig(req);
        case 'knowledge-base':
          return await handleKnowledgeBase(req);
        case 'openai':
          return await handleOpenAI(req);
        case 'search-knowledge-base':
          return await handleSearchKnowledgeBase(req);
        case 'list-vectors':
          return await handleListVectors(req);
        default:
          return createErrorResponse({
            message: `Action '${action}' non reconnue`,
            status: 400
          });
      }
    } catch (handlerError) {
      // Capture les erreurs spécifiques aux handlers
      logError(`Erreur dans le handler pour l'action '${action}':`, handlerError);
      
      return createErrorResponse({
        message: `Erreur lors du traitement de l'action '${action}'`,
        status: 500,
        details: handlerError instanceof Error ? handlerError.message : String(handlerError)
      });
    }
  } catch (error) {
    // Dernière ligne de défense contre les erreurs
    logError(`Erreur non gérée dans le routeur: ${error instanceof Error ? error.message : String(error)}`, error);
    
    return createErrorResponse({
      message: `Erreur interne du serveur`,
      status: 500,
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
