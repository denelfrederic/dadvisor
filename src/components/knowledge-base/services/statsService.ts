
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeBaseStats } from "../types";
import { isValidEmbedding, parseEmbedding } from "./embedding/embeddingUtils";

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
      console.log(`Analyzing ${entries.length} knowledge entries for embeddings`);
      
      // Compter les entrées avec embeddings valides
      for (const entry of entries) {
        try {
          // Afficher plus d'informations pour le débogage
          if (entry.embedding) {
            const embeddingInfo = typeof entry.embedding === 'string' 
              ? `String length: ${entry.embedding.length}` 
              : `Array length: ${Array.isArray(entry.embedding) ? entry.embedding.length : 'not array'}`;
            console.log(`Entry ${entry.id.substring(0, 8)} embedding info: ${embeddingInfo}`);
            
            if (typeof entry.embedding === 'string' && entry.embedding.length > 20) {
              try {
                const parsed = JSON.parse(entry.embedding);
                console.log(`Embedding parsed successfully for ${entry.id.substring(0, 8)}, type: ${typeof parsed}, is array: ${Array.isArray(parsed)}, length: ${Array.isArray(parsed) ? parsed.length : 'N/A'}`);
              } catch (e) {
                console.log(`Failed to parse embedding for ${entry.id.substring(0, 8)}: ${e.message}`);
              }
            }
          }
          
          const hasValidEmbedding = isValidEmbedding(entry.embedding);
          if (hasValidEmbedding) {
            withEmbeddings++;
            console.log(`Entry ${entry.id.substring(0, 8)} has valid embedding`);
          } else {
            console.log(`Entry ${entry.id.substring(0, 8)} does not have a valid embedding:`, 
              typeof entry.embedding, 
              entry.embedding ? (typeof entry.embedding === 'string' ? entry.embedding.substring(0, 30) + '...' : 'non-string') : 'null'
            );
          }
          
          // Analyser les sources comme catégories
          const category = entry.source || 'Non catégorisé';
          categories[category] = (categories[category] || 0) + 1;
        } catch (e) {
          console.error(`Error checking embedding for entry ${entry.id}:`, e);
        }
      }
    }
    
    console.log(`Statistics: Total entries: ${count}, With embeddings: ${withEmbeddings}`);
    
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
    let docWithEmbeddings = 0;
    
    // Vérifier plus précisément si l'embedding existe et est valide
    if (documents) {
      console.log(`Analyzing ${documents.length} documents for embeddings`);
      
      for (const doc of documents) {
        try {
          // Afficher plus d'informations pour le débogage
          if (doc.embedding) {
            const embeddingInfo = typeof doc.embedding === 'string' 
              ? `String length: ${doc.embedding.length}` 
              : `Array length: ${Array.isArray(doc.embedding) ? doc.embedding.length : 'not array'}`;
            console.log(`Document ${doc.id.substring(0, 8)} embedding info: ${embeddingInfo}`);
          }
          
          const hasValidEmbedding = isValidEmbedding(doc.embedding);
          if (hasValidEmbedding) {
            docWithEmbeddings++;
            console.log(`Document ${doc.id.substring(0, 8)} has valid embedding`);
          } else {
            console.log(`Document ${doc.id.substring(0, 8)} does not have a valid embedding:`, 
              typeof doc.embedding, 
              doc.embedding ? (typeof doc.embedding === 'string' ? doc.embedding.substring(0, 30) + '...' : 'non-string') : 'null'
            );
          }
        } catch (e) {
          console.error(`Error checking embedding for document ${doc.id}:`, e);
        }
      }
    }
    
    const docWithoutEmbeddings = docTotal - docWithEmbeddings;
    const docPercentage = docTotal > 0 
      ? Math.round((docWithEmbeddings / docTotal) * 100) 
      : 0;
    
    console.log(`Documents: Total: ${docTotal}, With embeddings: ${docWithEmbeddings}, Percentage: ${docPercentage}%`);
    
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
