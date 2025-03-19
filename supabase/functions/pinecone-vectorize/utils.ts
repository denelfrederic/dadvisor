
// Utility functions for the Pinecone Edge Function

// Standard CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to log with timestamps
export const logWithTimestamp = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[${timestamp}] ${message}`, data);
  } else {
    console.log(`[${timestamp}] ${message}`);
  }
};

// Helper to create standardized error responses
export const createErrorResponse = (error: any, status = 500) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  logWithTimestamp(`Error in Pinecone function: ${errorMessage}`, error);
  
  return new Response(
    JSON.stringify({
      success: false,
      error: errorMessage
    }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
};

// Helper to create standardized success responses
export const createSuccessResponse = (data: any) => {
  return new Response(
    JSON.stringify({
      success: true,
      ...data
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
};

// Validate environment variables and configuration
export const validateConfig = () => {
  const PINECONE_API_KEY = Deno.env.get('PINECONE_API_KEY');
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  
  if (!PINECONE_API_KEY) {
    throw new Error('Missing Pinecone API key');
  }
  
  if (!OPENAI_API_KEY) {
    throw new Error('Missing OpenAI API key');
  }
  
  return {
    PINECONE_API_KEY,
    OPENAI_API_KEY,
    PINECONE_ENVIRONMENT: 'gcp-starter',
    PINECONE_INDEX: 'document-vectors',
  };
};

// Helper to get the Pinecone base URL
export const getPineconeBaseUrl = (environment: string, index: string) => {
  return `https://${index}-${environment}.svc.${environment}.pinecone.io`;
};
