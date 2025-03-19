
import { supabase } from "@/integrations/supabase/client";
import { DocumentSearchResult } from '../../types';

// Recherche de documents avec similarité vectorielle via Pinecone
export const searchLocalDocuments = async (query: string): Promise<DocumentSearchResult[]> => {
  try {
    // Essayer d'abord la recherche vectorielle si possible
    try {
      console.log("Tentative de recherche sémantique via Pinecone pour:", query);
      
      // Appeler l'edge function Pinecone pour la recherche
      const { data: pineconeResults, error: pineconeError } = await supabase.functions.invoke('pinecone-vectorize', {
        body: {
          action: 'query',
          query: query
        }
      });
      
      if (pineconeError) {
        console.error("Erreur lors de la recherche via Pinecone:", pineconeError);
        throw pineconeError;
      }
      
      if (pineconeResults.success && pineconeResults.results && pineconeResults.results.length > 0) {
        console.log("Résultats de recherche Pinecone trouvés:", pineconeResults.results.length);
        
        // Récupérer les IDs des documents trouvés
        const documentIds = pineconeResults.results.map((match: any) => match.id);
        
        // Récupérer les informations complètes des documents depuis Supabase
        const { data: documents, error: fetchError } = await supabase
          .from('documents')
          .select('*')
          .in('id', documentIds);
          
        if (fetchError) {
          console.error("Erreur lors de la récupération des documents:", fetchError);
          throw fetchError;
        }
        
        // Associer les scores de similarité aux documents
        const documentsWithScores = documents.map((doc: any) => {
          const match = pineconeResults.results.find((m: any) => m.id === doc.id);
          return {
            id: doc.id,
            title: doc.title || "Sans titre",
            content: doc.content,
            type: doc.type,
            source: doc.source,
            score: match ? match.score : 0,
            matchCount: 1
          };
        });
        
        // Trier par score décroissant
        return documentsWithScores.sort((a: any, b: any) => b.score - a.score);
      }
    } catch (vectorSearchError) {
      console.warn("Recherche vectorielle échouée, repli sur la recherche textuelle:", vectorSearchError);
      // Continuer avec la recherche textuelle en cas d'échec
    }
    
    // Recherche textuelle classique (fallback)
    console.log("Utilisation de la recherche textuelle (fallback)");
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
