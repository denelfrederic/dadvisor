
// Utilitaires CORS pour les edge functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export const corsedResponse = (body: any, status = 200) => {
  return new Response(
    JSON.stringify(body),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status
    }
  );
};
