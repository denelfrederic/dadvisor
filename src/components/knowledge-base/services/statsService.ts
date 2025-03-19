
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeBaseStats, CombinedReport } from "../types";
import { isValidEmbedding } from "./embedding/embeddingUtils";

/**
 * Fetches and compiles statistics about the knowledge base
 */
export const getKnowledgeBaseStats = async (): Promise<KnowledgeBaseStats> => {
  try {
    // Get total count of entries
    const { count, error } = await supabase
      .from('knowledge_entries')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    
    // Get entries to check for embeddings and categories
    const { data: entries, error: entriesError } = await supabase
      .from('knowledge_entries')
      .select('id, source, embedding');
    
    if (entriesError) throw entriesError;
    
    // Count entries with valid embeddings and categorize by source
    let withEmbeddings = 0;
    const categories: Record<string, number> = {};
    
    if (entries && entries.length > 0) {
      for (const entry of entries) {
        // Check embedding validity
        if (entry.embedding && isValidEmbedding(entry.embedding)) {
          withEmbeddings++;
        }
        
        // Count by category
        const category = entry.source || 'Non catégorisé';
        categories[category] = (categories[category] || 0) + 1;
      }
    }
    
    return {
      count: count || 0,
      withEmbeddings,
      categories,
      categoriesCount: Object.keys(categories).length
    };
  } catch (error) {
    console.error('Error getting knowledge base stats:', error);
    return {
      count: 0,
      withEmbeddings: 0,
      categories: {},
      categoriesCount: 0
    };
  }
};

/**
 * Generates a combined report of knowledge base and document statistics
 */
export const generateCombinedReport = async (): Promise<CombinedReport> => {
  try {
    // Get knowledge base stats
    const kbStats = await getKnowledgeBaseStats();
    
    // Get document stats
    const { data: docs, error: docsError } = await supabase
      .from('documents')
      .select('id, embedding');
    
    if (docsError) throw docsError;
    
    const docCount = docs?.length || 0;
    let docsWithEmbeddings = 0;
    
    if (docs && docs.length > 0) {
      docsWithEmbeddings = docs.filter(doc => doc.embedding && isValidEmbedding(doc.embedding)).length;
    }
    
    return {
      knowledgeBase: kbStats,
      documents: {
        total: docCount,
        withEmbeddings: docsWithEmbeddings,
        withoutEmbeddings: docCount - docsWithEmbeddings,
        percentage: docCount > 0 ? Math.round((docsWithEmbeddings / docCount) * 100) : 0
      }
    };
  } catch (error) {
    console.error('Error generating combined report:', error);
    return {
      knowledgeBase: {
        count: 0,
        withEmbeddings: 0,
        categories: {},
        categoriesCount: 0
      },
      documents: {
        total: 0,
        withEmbeddings: 0,
        withoutEmbeddings: 0,
        percentage: 0
      }
    };
  }
};
