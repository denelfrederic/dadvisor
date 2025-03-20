
/**
 * Gestionnaire pour les requêtes de recherche Pinecone
 */

import { corsHeaders } from "../utils/cors.ts";
import { logMessage, logError } from "../utils/logging.ts";
import { getPineconeOperationUrl } from "../services/pinecone/config.ts";
import { PINECONE_HEADERS } from "../services/pinecone/config.ts";
import { getPineconeIndex } from "../config.ts";
import { generateEmbeddingWithOpenAI } from "../services/openai.ts";

/**
 * Gère l'action de requête vers Pinecone
 * @param requestData Données de la requête
 * @returns Réponse formatée pour le client
 */
export async function handleQueryAction(requestData: any) {
  try {
    // Log de la requête
    logMessage(`Requête de recherche Pinecone reçue: ${JSON.stringify(requestData)}`, 'info');
    
    // Vérifier si c'est une requête de test
    if (requestData._test) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Requête de test traitée avec succès",
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Vérifier que la requête contient une question
    if (!requestData.query) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Paramètre 'query' requis pour la recherche",
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    try {
      // Générer l'embedding à partir de la question
      const queryEmbedding = await generateEmbeddingWithOpenAI(requestData.query);
      
      if (!queryEmbedding) {
        throw new Error("Impossible de générer l'embedding pour la requête");
      }
      
      // Préparer la requête Pinecone
      const index = getPineconeIndex();
      const queryUrl = getPineconeOperationUrl("query");
      
      if (!queryUrl) {
        throw new Error("URL Pinecone non disponible pour l'opération de requête");
      }
      
      // Paramètres de la requête Pinecone
      const queryData = {
        vector: queryEmbedding,
        topK: requestData.topK || 5,
        includeMetadata: true,
        namespace: requestData.namespace || "documents"
      };
      
      // Appel à l'API Pinecone
      logMessage(`Envoi de la requête à Pinecone: ${queryUrl}`, 'info');
      const pineconeResponse = await fetch(queryUrl, {
        method: 'POST',
        headers: PINECONE_HEADERS,
        body: JSON.stringify(queryData)
      });
      
      if (!pineconeResponse.ok) {
        const errorText = await pineconeResponse.text();
        throw new Error(`Erreur Pinecone (${pineconeResponse.status}): ${errorText}`);
      }
      
      // Traiter la réponse
      const pineconeData = await pineconeResponse.json();
      
      // Transformer les résultats
      const results = pineconeData.matches?.map((match: any) => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata || {}
      })) || [];
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          results,
          count: results.length,
          query: requestData.query,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (queryError) {
      const errorMessage = queryError instanceof Error ? queryError.message : String(queryError);
      logError("Erreur lors de la recherche Pinecone", queryError);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          query: requestData.query,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } catch (error) {
    // Journaliser l'erreur
    const errorMessage = logError("Erreur lors du traitement de la requête de recherche", error);
    
    // Renvoyer une réponse d'erreur
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
