
// Edge function principale pour les opérations Pinecone

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { handleVectorizeAction } from "./handlers/vectorizeHandler.ts";
import { handleQueryAction } from "./handlers/queryHandler.ts";
import { handleConfigAction } from "./handlers/configHandler.ts";
import { testPineconeConnection } from "./services/pinecone/connection.ts";
import { handleSearchKnowledgeBaseAction } from "./handlers/knowledgeBaseHandler.ts";
import { logMessage, logError } from "./utils/logging.ts";

const ENABLE_DETAILED_DIAGNOSTICS = true;

serve(async (req) => {
  // Log pour diagnostiquer le démarrage de la fonction
  console.log(`[${new Date().toISOString()}] Edge function invoquée: ${req.url}`);
  
  // 1. Gestion des requêtes CORS OPTIONS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 2. Vérification initiale de l'environnement (diagnostics)
    if (ENABLE_DETAILED_DIAGNOSTICS) {
      console.log("Diagnostics d'environnement Deno:");
      console.log(`Version Deno: ${Deno.version.deno}`);
      console.log(`Variables d'environnement présentes:`);
      const envVars = [
        "PINECONE_API_KEY", 
        "PINECONE_BASE_URL", 
        "OPENAI_API_KEY",
        "ALTERNATIVE_PINECONE_URL",
        "PINECONE_INDEX"
      ];
      for (const envVar of envVars) {
        const value = Deno.env.get(envVar);
        console.log(`- ${envVar}: ${value ? "Présente" : "Manquante"}`);
        // Pour les URL, valider le format sans exposer la valeur complète
        if (value && envVar.includes("URL")) {
          console.log(`  Format: ${value.startsWith("http") ? "Valide" : "Invalide"}`);
          console.log(`  Longueur: ${value.length} caractères`);
        }
      }
    }

    // 3. Extraction du corps de la requête
    const requestData = await req.json();
    const { action } = requestData;

    if (!action) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Action manquante dans la requête" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Action demandée: ${action}`);

    // 4. Routage vers le gestionnaire approprié
    try {
      switch (action) {
        case "vectorize":
          return await handleVectorizeAction(requestData);
        case "query":
          return await handleQueryAction(requestData);
        case "config":
          return await handleConfigAction();
        case "test-connection":
          return new Response(
            JSON.stringify(await testPineconeConnection()),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        case "search-knowledge-base":
          return await handleSearchKnowledgeBaseAction(requestData);
        default:
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Action inconnue: ${action}` 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
      }
    } catch (handlerError) {
      // Log détaillé de l'erreur spécifique au gestionnaire
      const errorMsg = logError(`Erreur lors du traitement de l'action "${action}"`, handlerError);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMsg,
          action: action,
          diagnostics: ENABLE_DETAILED_DIAGNOSTICS ? {
            errorType: handlerError.name,
            errorStack: handlerError.stack,
            timestamp: new Date().toISOString()
          } : undefined
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } catch (error) {
    // Erreur globale (comme une erreur de parsing JSON)
    console.error("Erreur globale de l'edge function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Erreur lors du traitement de la requête: ${error instanceof Error ? error.message : String(error)}`,
        diagnostics: ENABLE_DETAILED_DIAGNOSTICS ? {
          errorType: error.name,
          errorStack: error.stack,
          timestamp: new Date().toISOString()
        } : undefined
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
