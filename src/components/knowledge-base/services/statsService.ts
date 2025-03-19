
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeBaseStats, CombinedReport } from "../types";
import { isValidEmbedding } from "./embedding/embeddingUtils";

/**
 * Get statistics for the knowledge base
 */
export const getKnowledgeBaseStats = async (): Promise<KnowledgeBaseStats> => {
  try {
    // Récupérer le count total
    const { count, error } = await supabase
      .from('knowledge_entries')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      return { count: 0 };
    }
    
    // Récupérer les catégories (sources)
    const { data: sourcesData, error: sourcesError } = await supabase
      .from('knowledge_entries')
      .select('source');
    
    if (sourcesError) {
      console.error("Erreur lors de la récupération des sources:", sourcesError);
      return { count: count || 0 };
    }
    
    // Compter les entrées par source
    const categories: Record<string, number> = {};
    sourcesData?.forEach(entry => {
      const source = entry.source || 'Non catégorisé';
      categories[source] = (categories[source] || 0) + 1;
    });
    
    // Récupérer les entrées avec embeddings
    const { data: entriesWithEmbedding, error: embeddingError } = await supabase
      .from('knowledge_entries')
      .select('id, embedding');
    
    if (embeddingError) {
      console.error("Erreur lors de la récupération des embeddings:", embeddingError);
      return { 
        count: count || 0, 
        categories,
        categoriesCount: Object.keys(categories).length
      };
    }
    
    // Compter les entrées avec embeddings valides
    let withEmbeddings = 0;
    if (entriesWithEmbedding && entriesWithEmbedding.length > 0) {
      for (const entry of entriesWithEmbedding) {
        if (entry.embedding && isValidEmbedding(entry.embedding)) {
          withEmbeddings++;
        }
      }
    }
    
    return {
      count: count || 0,
      withEmbeddings,
      categories,
      categoriesCount: Object.keys(categories).length
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return { count: 0 };
  }
};

/**
 * Get combined statistics for knowledge base and documents
 */
export const getCombinedStats = async (): Promise<CombinedReport> => {
  try {
    // Récupérer les statistiques de la base de connaissances
    const kbStats = await getKnowledgeBaseStats();
    
    // Récupérer les statistiques des documents
    const { data: allDocuments, error: docsError } = await supabase
      .from('documents')
      .select('id, embedding');
    
    if (docsError) {
      console.error("Erreur lors de la récupération des documents:", docsError);
      return {
        knowledgeBase: kbStats,
        documents: {
          total: 0,
          withEmbeddings: 0,
          withoutEmbeddings: 0,
          percentage: 0
        }
      };
    }
    
    // Analyser les documents
    const totalDocs = allDocuments?.length || 0;
    let withEmbeddings = 0;
    
    if (allDocuments && allDocuments.length > 0) {
      for (const doc of allDocuments) {
        if (doc.embedding && isValidEmbedding(doc.embedding)) {
          withEmbeddings++;
        }
      }
    }
    
    const withoutEmbeddings = totalDocs - withEmbeddings;
    const percentage = totalDocs > 0 ? Math.round((withEmbeddings / totalDocs) * 100) : 0;
    
    return {
      knowledgeBase: kbStats,
      documents: {
        total: totalDocs,
        withEmbeddings,
        withoutEmbeddings,
        percentage
      }
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques combinées:", error);
    return {
      knowledgeBase: { count: 0 },
      documents: {
        total: 0,
        withEmbeddings: 0,
        withoutEmbeddings: 0,
        percentage: 0
      }
    };
  }
};
