
// Utilitaires pour la gestion des CORS

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Crée une réponse CORS pour les requêtes OPTIONS
 */
export const handleCorsOptions = () => {
  return new Response(null, { headers: corsHeaders });
};

/**
 * Créer une réponse d'erreur avec les en-têtes CORS
 */
export const createErrorResponse = (message: string, status = 500) => {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
};

/**
 * Créer une réponse de succès avec les en-têtes CORS
 */
export const createSuccessResponse = (data: any) => {
  return new Response(
    JSON.stringify({ success: true, ...data }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
};
