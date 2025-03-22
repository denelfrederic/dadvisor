
import { handleVectorize } from "./handlers/vectorizeHandler.ts";
import { handleQuery } from "./handlers/queryHandler.ts";
import { handleConfig } from "./handlers/configHandler.ts";
import { handleTestConnection } from "./handlers/testConnectionHandler.ts";
import { handleUpdateConfig } from "./handlers/updateConfigHandler.ts";
import { handleKnowledgeBase } from "./handlers/knowledgeBaseHandler.ts";
import { handleOpenAI } from "./handlers/openaiHandler.ts";
import { handleSearchKnowledgeBase } from "./handlers/searchKnowledgeBaseHandler.ts";
import { handleListVectors } from "./handlers/listVectorsHandler.ts";

/**
 * Router pour les requêtes Pinecone
 * @param req La requête HTTP
 * @returns Response avec le résultat de l'action ou une erreur
 */
export async function route(req: Request): Promise<Response> {
  const { action } = await req.json();
  
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
      return new Response(
        JSON.stringify({
          success: false,
          error: `Action '${action}' non reconnue`
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
  }
}
