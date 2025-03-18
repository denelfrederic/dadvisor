
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeBaseStats } from "./types";

/**
 * Get statistics about the knowledge base
 */
export const getKnowledgeBaseStats = async (): Promise<KnowledgeBaseStats> => {
  try {
    const { count, error } = await supabase
      .from('knowledge_entries')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error("Error getting knowledge base stats:", error);
      return { count: 0 };
    }
    
    return { 
      count: count || 0
    };
  } catch (error) {
    console.error("Exception while getting knowledge base stats:", error);
    return { count: 0 };
  }
};
