
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  corsHeaders, 
  logWithTimestamp, 
  createErrorResponse, 
  createSuccessResponse, 
  validateConfig 
} from './utils.ts';
import { handleVectorize, handleQuery } from './handlers.ts';

logWithTimestamp('Pinecone Edge Function initializing...');

try {
  // Validate configuration on startup
  const config = validateConfig();
  logWithTimestamp(`Pinecone Edge Function initialized. Environment: ${config.PINECONE_ENVIRONMENT}, Index: ${config.PINECONE_INDEX}`);
  logWithTimestamp(`API keys available: Pinecone: ${config.PINECONE_API_KEY ? "Yes" : "No"}, OpenAI: ${config.OPENAI_API_KEY ? "Yes" : "No"}`);

  serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      logWithTimestamp(`New ${req.method} request received from ${req.headers.get('origin') || 'unknown origin'}`);
      
      // Parse request body
      const reqBody = await req.json();
      const { action } = reqBody;
      
      logWithTimestamp(`Action requested: ${action}`);
      
      // Route to the appropriate handler based on action
      switch (action) {
        case 'vectorize': {
          const result = await handleVectorize(reqBody, config);
          return createSuccessResponse(result);
        }
        
        case 'query': {
          const result = await handleQuery(reqBody, config);
          return createSuccessResponse(result);
        }
        
        default:
          logWithTimestamp(`Unknown action: ${action}`);
          return createErrorResponse(`Unknown action: ${action}`, 400);
      }
    } catch (error) {
      return createErrorResponse(error);
    }
  });
} catch (initError) {
  logWithTimestamp('Fatal error during initialization:', initError);
  console.error('Failed to initialize Pinecone Edge Function:', initError);
}
