
// handlers/knowledgeBaseHandler.ts
import { corsedResponse } from "../utils/response.ts";
import { logMessage, logError } from "../utils/logging.ts";
import { supabaseClient } from "../services/supabase.ts";
import { generateEmbeddingWithOpenAI } from "../services/openai.ts";

/**
 * Gestionnaire pour la recherche dans la base de connaissances
 * Utilise une approche hybride combinant recherche vectorielle et textuelle
 */
export async function handleSearchKnowledgeBaseAction(body: any) {
  try {
    logMessage("Début du traitement de la requête search-knowledge-base", 'info');
    
    const { query, threshold = 0.5, limit = 10, hybrid = true } = body;

    if (!query) {
      return corsedResponse({
        success: false,
        error: "Requête de recherche manquante"
      }, 400);
    }

    logMessage(`Recherche dans la base de connaissances pour: "${query}"`, 'info');

    // Vérifier si les services requis sont disponibles
    if (!Deno.env.get("OPENAI_API_KEY")) {
      logMessage("OPENAI_API_KEY manquante pour la génération d'embedding", 'error');
      return corsedResponse({
        success: false,
        error: "Configuration OpenAI manquante",
        requiredEnvVars: ["OPENAI_API_KEY"]
      }, 500);
    }

    if (!supabaseClient) {
      logMessage("Client Supabase non initialisé", 'error');
      return corsedResponse({
        success: false,
        error: "Client Supabase non disponible",
        requiredEnvVars: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
      }, 500);
    }

    // Générer l'embedding pour la requête
    try {
      logMessage("Génération de l'embedding pour la requête", 'info');
      const embedding = await generateEmbeddingWithOpenAI(query);
      
      if (!embedding || !Array.isArray(embedding)) {
        logMessage("Échec de génération de l'embedding", 'error');
        return corsedResponse({
          success: false,
          error: "Impossible de générer l'embedding pour la requête"
        }, 500);
      }
      
      logMessage(`Embedding généré avec succès (${embedding.length} dimensions)`, 'info');

      // Seuil de similarité plus bas pour obtenir plus de résultats
      const similarityThreshold = threshold;
      
      // Stocker les résultats des deux approches
      let vectorResults = [];
      let textResults = [];
      
      // 1. Recherche vectorielle
      try {
        logMessage("Exécution de la recherche vectorielle", 'info');
        const { data: vectorData, error: vectorError } = await supabaseClient.rpc('match_knowledge_entries', {
          query_embedding: embedding,
          similarity_threshold: similarityThreshold,
          match_count: limit * 2 // Récupérer plus de résultats pour la fusion
        });
        
        if (vectorError) {
          logError("Erreur lors de la recherche vectorielle", vectorError);
        } else {
          vectorResults = vectorData || [];
          logMessage(`Résultats de recherche vectorielle: ${vectorResults.length}`, 'info');
        }
      } catch (vectorSearchError) {
        logError("Exception lors de la recherche vectorielle", vectorSearchError);
      }
      
      // 2. Recherche textuelle (si approche hybride)
      if (hybrid) {
        try {
          logMessage("Exécution de la recherche textuelle (hybride)", 'info');
          const searchTerms = query.toLowerCase()
            .split(/\s+/)
            .filter(term => term.length > 2);
            
          const searchQuery = searchTerms
            .map(term => `%${term}%`)
            .join(' | ');
            
          const { data: textData, error: textError } = await supabaseClient
            .from('knowledge_entries')
            .select('*')
            .or(`question.ilike.${searchQuery},answer.ilike.${searchQuery}`)
            .limit(limit);
          
          if (textError) {
            logError("Erreur lors de la recherche textuelle", textError);
          } else {
            textResults = textData || [];
            logMessage(`Résultats de recherche textuelle: ${textResults.length}`, 'info');
          }
        } catch (textSearchError) {
          logError("Exception lors de la recherche textuelle", textSearchError);
        }
      }
      
      // 3. Fusionner et dédupliquer les résultats
      const allResults = [...vectorResults];
      
      // Ajouter les résultats textuels non dupliqués
      for (const textResult of textResults) {
        if (!allResults.some(item => item.id === textResult.id)) {
          // Ajouter un score de similarité fictif pour les résultats textuels
          allResults.push({
            ...textResult,
            similarity: 0.6 // Valeur arbitraire pour les résultats textuels
          });
        }
      }
      
      // 4. Trier les résultats par pertinence
      allResults.sort((a, b) => {
        // Priorité à la similarité vectorielle
        if (a.similarity !== b.similarity) {
          return b.similarity - a.similarity;
        }
        // Ensuite par date de mise à jour
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      });
      
      // Limiter les résultats après fusion
      const finalResults = allResults.slice(0, limit);
      
      logMessage(`Résultats finaux après fusion: ${finalResults.length}`, 'info');
      
      return corsedResponse({
        success: true,
        results: finalResults,
        vectorResultsCount: vectorResults.length,
        textResultsCount: textResults.length,
        query,
        timestamp: new Date().toISOString()
      });
    } catch (embeddingError) {
      logError("Erreur lors de la génération de l'embedding", embeddingError);
      return corsedResponse({
        success: false,
        error: `Erreur lors de la génération de l'embedding: ${embeddingError instanceof Error ? embeddingError.message : String(embeddingError)}`
      }, 500);
    }
  } catch (error) {
    const errorMsg = logError("Erreur lors de la recherche dans la base de connaissances", error);
    return corsedResponse({
      success: false,
      error: errorMsg
    }, 500);
  }
}
