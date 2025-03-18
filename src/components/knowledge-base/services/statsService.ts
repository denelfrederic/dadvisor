
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeBaseStats } from "../types";
import { parseEmbedding } from "./embedding/embeddingUtils";

/**
 * Get statistics about the knowledge base
 */
export const getKnowledgeBaseStats = async (): Promise<KnowledgeBaseStats> => {
  try {
    // Récupérer le nombre total d'entrées
    const { count, error } = await supabase
      .from('knowledge_entries')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error("Error getting knowledge base stats:", error);
      return { count: 0 };
    }
    
    // Vérifier les catégories (sources) et les embeddings
    let categories: Record<string, number> = {};
    let withEmbeddings = 0;
    
    // Récupérer toutes les entrées pour analyse
    const { data: entries, error: entriesError } = await supabase
      .from('knowledge_entries')
      .select('id, source, embedding');
    
    if (!entriesError && entries) {
      // Compter les entrées avec embeddings correctement
      withEmbeddings = entries.filter(entry => {
        try {
          // Vérifier si l'embedding existe et est non vide
          return entry.embedding !== null && 
                 typeof entry.embedding === 'string' && 
                 entry.embedding.length > 2; // Au moins "{}" + quelque chose
        } catch (e) {
          console.error("Error checking embedding:", e);
          return false;
        }
      }).length;
      
      // Analyser les sources comme catégories
      entries.forEach(entry => {
        const category = entry.source || 'Non catégorisé';
        categories[category] = (categories[category] || 0) + 1;
      });
    }
    
    return { 
      count: count || 0,
      withEmbeddings: withEmbeddings,
      categories: categories,
      categoriesCount: Object.keys(categories).length
    };
  } catch (error) {
    console.error("Exception while getting knowledge base stats:", error);
    return { count: 0 };
  }
};

/**
 * Génère un rapport combiné pour les documents et la base de connaissances
 */
export const generateCombinedReport = async (): Promise<{
  knowledgeBase: KnowledgeBaseStats;
  documents: {
    total: number;
    withEmbeddings: number;
    withoutEmbeddings: number;
    percentage: number;
  };
}> => {
  try {
    // Statistiques de la base de connaissances
    const kbStats = await getKnowledgeBaseStats();
    
    // Statistiques des documents
    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, embedding');
    
    if (error) {
      throw new Error(`Erreur lors de la récupération des documents: ${error.message}`);
    }
    
    const docTotal = documents?.length || 0;
    
    // Vérifier plus précisément si l'embedding existe
    const docWithEmbeddings = documents?.filter(doc => {
      try {
        // Vérifier si l'embedding existe et est non vide
        return doc.embedding !== null && 
               typeof doc.embedding === 'string' && 
               doc.embedding.length > 2; // Au moins "{}" + quelque chose
      } catch (e) {
        console.error("Error checking document embedding:", e);
        return false;
      }
    }).length || 0;
    
    const docWithoutEmbeddings = docTotal - docWithEmbeddings;
    const docPercentage = docTotal > 0 
      ? Math.round((docWithEmbeddings / docTotal) * 100) 
      : 0;
    
    return {
      knowledgeBase: kbStats,
      documents: {
        total: docTotal,
        withEmbeddings: docWithEmbeddings,
        withoutEmbeddings: docWithoutEmbeddings,
        percentage: docPercentage
      }
    };
  } catch (error) {
    console.error("Exception generating combined report:", error);
    throw error;
  }
};
