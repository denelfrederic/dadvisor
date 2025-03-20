
/**
 * Gestionnaire pour les requêtes de recherche dans la base de connaissances
 */

import { corsedResponse } from "../utils/cors.ts";
import { checkSupabaseConnection } from "../services/supabase.ts";
import { logMessage, logError } from "../utils/logging.ts";
import { generateEmbeddingWithOpenAI } from "../services/openai.ts";
import { PINECONE_API_KEY, PINECONE_NAMESPACE } from "../config.ts";
import { performPineconeQuery } from "../services/pinecone/query.ts";

// Interface pour les entrées de la base de connaissances
interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  source?: string;
  similarity?: number;
}

/**
 * Recherche dans la base de connaissances via Pinecone
 * @param requestData Données de la requête
 * @returns Résultats de la recherche
 */
export async function handleSearchKnowledgeBaseAction(requestData: any) {
  try {
    // Validation des paramètres requis
    const { query, threshold = 0.5, limit = 5, hybrid = false } = requestData;
    
    if (!query) {
      return corsedResponse({ 
        success: false, 
        error: "Requête manquante" 
      }, 400);
    }
    
    // Vérifier la connexion à Supabase
    const supabaseStatus = checkSupabaseConnection();
    if (!supabaseStatus.success) {
      return corsedResponse({ 
        success: false, 
        error: `Erreur Supabase: ${supabaseStatus.error}` 
      }, 500);
    }
    
    // Générer l'embedding pour la requête
    logMessage(`Génération de l'embedding pour la requête: "${query.substring(0, 50)}..."`, 'info');
    const embeddingResult = await generateEmbeddingWithOpenAI(query);
    
    if (!embeddingResult.success) {
      return corsedResponse({ 
        success: false, 
        error: `Erreur lors de la génération de l'embedding: ${embeddingResult.error}` 
      }, 500);
    }
    
    // Vérifier si la clé API Pinecone est disponible
    if (!PINECONE_API_KEY) {
      return corsedResponse({ 
        success: false, 
        error: "Clé API Pinecone non configurée" 
      }, 500);
    }
    
    // Exécuter la requête sur Pinecone
    logMessage(`Recherche Pinecone pour "${query.substring(0, 30)}..." avec seuil ${threshold}`, 'info');
    
    const pineconeQueryResult = await performPineconeQuery({
      namespace: PINECONE_NAMESPACE,
      vector: embeddingResult.embedding,
      topK: limit,
      includeMetadata: true,
      filter: { type: "knowledge_entry" }
    });
    
    if (!pineconeQueryResult.success) {
      return corsedResponse({ 
        success: false, 
        error: `Erreur lors de la requête Pinecone: ${pineconeQueryResult.error}` 
      }, 500);
    }
    
    // Transformation des résultats
    const matches = pineconeQueryResult.matches || [];
    logMessage(`${matches.length} résultats obtenus de Pinecone`, 'info');
    
    // Filtrer selon le seuil de similarité
    const filteredMatches = matches.filter(match => match.score && match.score >= threshold);
    logMessage(`${filteredMatches.length} résultats après filtrage par seuil ${threshold}`, 'info');
    
    // Convertir en objets KnowledgeEntry
    const results: KnowledgeEntry[] = filteredMatches.map(match => {
      // Les métadonnées contiennent les informations de l'entrée
      const metadata = match.metadata || {};
      
      return {
        id: match.id,
        question: metadata.question || "Question inconnue",
        answer: metadata.answer || "Réponse inconnue",
        source: metadata.source || "",
        similarity: match.score || 0
      };
    });
    
    // Retourner les résultats
    return corsedResponse({
      success: true,
      query,
      results,
      count: results.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    const errorMsg = logError("Erreur lors de la recherche dans la base de connaissances", error);
    return corsedResponse({ 
      success: false, 
      error: errorMsg 
    }, 500);
  }
}
