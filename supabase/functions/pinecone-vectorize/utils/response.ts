
import { corsHeaders } from "./cors.ts";

/**
 * Crée une réponse d'erreur standardisée
 * @param options Options de la réponse d'erreur
 * @returns Response
 */
export function createErrorResponse(options: {
  message: string;
  status?: number;
  details?: any;
  headers?: HeadersInit;
}): Response {
  const { message, status = 500, details, headers = {} } = options;
  
  const responseBody = {
    success: false,
    error: message,
    details: details,
    timestamp: new Date().toISOString()
  };
  
  const combinedHeaders = {
    ...corsHeaders,
    'Content-Type': 'application/json',
    ...headers
  };
  
  return new Response(JSON.stringify(responseBody), {
    status,
    headers: combinedHeaders
  });
}

/**
 * Crée une réponse de succès standardisée
 * @param data Données à inclure dans la réponse
 * @param options Options de la réponse
 * @returns Response
 */
export function createSuccessResponse(
  data: any,
  options: {
    status?: number;
    headers?: HeadersInit;
  } = {}
): Response {
  const { status = 200, headers = {} } = options;
  
  const responseBody = {
    success: true,
    ...data,
    timestamp: new Date().toISOString()
  };
  
  const combinedHeaders = {
    ...corsHeaders,
    'Content-Type': 'application/json',
    ...headers
  };
  
  return new Response(JSON.stringify(responseBody), {
    status,
    headers: combinedHeaders
  });
}
