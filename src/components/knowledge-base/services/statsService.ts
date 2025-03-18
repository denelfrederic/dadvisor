
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeBaseStats } from "../types";

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
    
    // Vérifier les embeddings (si la colonne embedding existe)
    let withEmbeddings = 0;
    let categories: Record<string, number> = {};
    
    // Récupérer toutes les entrées pour analyse
    const { data: entries, error: entriesError } = await supabase
      .from('knowledge_entries')
      .select('id, embedding, source');
    
    if (!entriesError && entries) {
      // Compter les entrées avec embeddings
      withEmbeddings = entries.filter(entry => entry.embedding).length;
      
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
    const docWithEmbeddings = documents?.filter(doc => doc.embedding).length || 0;
    const docWithoutEmbeddings = docTotal - docWithEmbeddings;
    const docPercentage = docTotal > 0 ? Math.round((docWithEmbeddings / docTotal) * 100) : 0;
    
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
