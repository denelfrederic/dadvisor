
import { supabase } from "@/integrations/supabase/client";
import { DocumentSearchResult } from '../../types';

// Recherche de documents simplifiée (sans vectorisation Pinecone)
export const searchLocalDocuments = async (query: string): Promise<DocumentSearchResult[]> => {
  try {
    console.log("Utilisation de la recherche textuelle pour:", query);
    
    // Recherche textuelle classique uniquement
    const { data: textResults, error: textError } = await supabase.rpc('search_documents', {
      search_query: query
    });
      
    if (textError) {
      console.error("Erreur lors de la recherche textuelle:", textError);
      return [];
    }
    
    return textResults || [];
  } catch (error) {
    console.error("Erreur lors de la recherche dans les documents:", error);
    return [];
  }
};
