
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Import des modules refactorisés
import { PINECONE_API_KEY, OPENAI_API_KEY, PINECONE_BASE_URL, ALTERNATIVE_PINECONE_URL, PINECONE_INDEX, PINECONE_ENVIRONMENT, PINECONE_PROJECT, validateConfig } from "./config.ts";
import { generateEmbeddingWithOpenAI, generateEmbeddingWithE5 } from "./services/openai.ts";
import { upsertToPinecone, queryPinecone } from "./services/pinecone.ts";
import { corsHeaders, handleCorsOptions, createErrorResponse, createSuccessResponse } from "./utils/cors.ts";
import { logMessage, logError } from "./utils/logging.ts";

// Vérification de la configuration au démarrage
validateConfig();

serve(async (req) => {
  // Gestion des requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }
  
  try {
    logMessage(`Nouvelle requête ${req.method} reçue`);
    const reqBody = await req.json();
    const { action, documentId, documentContent, documentTitle, documentType, query } = reqBody;
    
    logMessage(`Action demandée: ${action}, Document ID: ${documentId || 'N/A'}`);
    
    // Vérification des clés API et message d'erreur détaillé
    if (!Deno.env.get('OPENAI_API_KEY') && !Deno.env.get('PINECONE_API_KEY')) {
      logMessage("ERREUR CRITIQUE: Les clés API OpenAI et Pinecone sont manquantes", "error");
      return createErrorResponse("Configuration incomplète: Les clés API OpenAI et Pinecone sont manquantes. Veuillez configurer ces clés dans les secrets Supabase.", 500);
    }
    
    if (!Deno.env.get('PINECONE_API_KEY')) {
      logMessage("ERREUR CRITIQUE: Clé API Pinecone manquante", "error");
      return createErrorResponse("Clé API Pinecone manquante. Veuillez configurer cette clé dans les secrets Supabase.", 500);
    }
    
    if (!Deno.env.get('OPENAI_API_KEY')) {
      logMessage("AVERTISSEMENT: Clé API OpenAI manquante, utilisation du modèle de secours", "warn");
    }
    
    switch (action) {
      case 'config': {
        // Action de diagnostic pour vérifier la configuration
        const configInfo = {
          apiKeys: {
            pinecone: !!Deno.env.get('PINECONE_API_KEY'),
            openai: !!Deno.env.get('OPENAI_API_KEY')
          },
          urls: {
            main: PINECONE_BASE_URL,
            alternative: ALTERNATIVE_PINECONE_URL
          },
          settings: {
            index: PINECONE_INDEX,
            environment: PINECONE_ENVIRONMENT,
            project: PINECONE_PROJECT
          },
          timestamp: new Date().toISOString()
        };
        
        // Test de connexion simple à Pinecone
        try {
          const pingResponse = await fetch(`${PINECONE_BASE_URL}/describe_index_stats`, {
            method: 'GET',
            headers: {
              'Api-Key': PINECONE_API_KEY || '',
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          });
          
          configInfo.pingTest = {
            status: pingResponse.status,
            ok: pingResponse.ok,
            statusText: pingResponse.statusText
          };
          
          if (pingResponse.ok) {
            try {
              const statsData = await pingResponse.json();
              configInfo.indexStats = statsData;
            } catch (e) {
              configInfo.parseError = "Impossible de parser les statistiques d'index";
            }
          }
        } catch (pingError) {
          configInfo.pingTest = {
            error: pingError instanceof Error ? pingError.message : String(pingError)
          };
        }
        
        return createSuccessResponse(configInfo);
      }
        
      case 'vectorize': {
        // Génération d'embedding pour le contenu du document
        if (!documentContent || !documentId) {
          logMessage("Paramètres manquants", "error");
          return createErrorResponse('Missing document content or ID', 400);
        }
        
        logMessage(`Génération d'embedding pour document: ${documentId} (content length: ${documentContent.length})`);
        
        // Génération d'embedding avec OpenAI ou mécanisme de secours
        let embedding;
        try {
          if (Deno.env.get('OPENAI_API_KEY')) {
            embedding = await generateEmbeddingWithOpenAI(documentContent);
            logMessage(`Dimensions de l'embedding OpenAI: ${embedding.length}`);
          } else {
            embedding = await generateEmbeddingWithE5(documentContent);
            logMessage(`Dimensions de l'embedding E5: ${embedding.length}`);
          }
        } catch (embeddingError) {
          logError("Erreur lors de la génération d'embedding", embeddingError);
          return createErrorResponse(`Échec de génération d'embedding: ${embeddingError instanceof Error ? embeddingError.message : String(embeddingError)}`, 500);
        }
        
        // Stockage dans Pinecone avec métadonnées
        const metadata = {
          title: documentTitle || 'Untitled',
          type: documentType || 'unknown',
          contentSnippet: documentContent.slice(0, 300) + '...',
          length: documentContent.length
        };
        
        try {
          // Insertion du vecteur dans Pinecone
          const result = await upsertToPinecone(documentId, embedding, metadata);
          
          logMessage(`Vectorisation réussie pour document: ${documentId}`);
          
          // Retourner également l'embedding pour stockage dans Supabase (backup)
          return createSuccessResponse({
            documentId,
            embedding,
            pineconeResult: result
          });
        } catch (pineconeError) {
          logError("Erreur lors de l'insertion dans Pinecone", pineconeError);
          return createErrorResponse(`Échec d'insertion dans Pinecone: ${pineconeError instanceof Error ? pineconeError.message : String(pineconeError)}`, 500);
        }
      }
      
      case 'query': {
        if (!query) {
          logMessage("Requête de recherche sans texte", "error");
          return createErrorResponse('Missing query text', 400);
        }
        
        logMessage(`Recherche sémantique: "${query}"`);
        
        // Générer l'embedding pour la requête
        let embedding;
        try {
          if (Deno.env.get('OPENAI_API_KEY')) {
            embedding = await generateEmbeddingWithOpenAI(query);
          } else {
            embedding = await generateEmbeddingWithE5(query);
          }
        } catch (embeddingError) {
          logError("Erreur lors de la génération d'embedding pour la recherche", embeddingError);
          return createErrorResponse(`Échec de génération d'embedding: ${embeddingError instanceof Error ? embeddingError.message : String(embeddingError)}`, 500);
        }
        
        // Recherche de documents similaires dans Pinecone
        try {
          const results = await queryPinecone(embedding, 5);
          
          logMessage(`${results.matches?.length || 0} résultats trouvés pour la requête`);
          
          return createSuccessResponse({
            results: results.matches || []
          });
        } catch (searchError) {
          logError("Erreur lors de la recherche dans Pinecone", searchError);
          return createErrorResponse(`Échec de recherche dans Pinecone: ${searchError instanceof Error ? searchError.message : String(searchError)}`, 500);
        }
      }
      
      default:
        logMessage(`Action inconnue: ${action}`, "error");
        return createErrorResponse(`Unknown action: ${action}`, 400);
    }
  } catch (error) {
    logError('Error in Pinecone function', error);
    return createErrorResponse(error instanceof Error ? error.message : String(error), 500);
  }
});
