
import { supabase } from "@/integrations/supabase/client";

export const analyzeDocumentEmbeddingIssue = async (documentId: string) => {
  try {
    console.log(`Analyse du document ${documentId} pour indexation Pinecone...`);
    
    // Récupérer le document
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (error) {
      console.error("Erreur lors de la récupération du document:", error);
      return {
        success: false,
        analysis: "Impossible d'analyser le document: erreur de récupération des données.",
      };
    }
    
    // Vérifier si le document existe
    if (!document) {
      return {
        success: false,
        analysis: "Document introuvable.",
      };
    }
    
    console.log(`Document récupéré: ${document.title}, type: ${document.type}, taille: ${document.size || 'non spécifiée'}`);
    
    // Analyser uniquement le statut Pinecone
    let analysis = "";
    let pineconeStatus = {
      indexed: document.pinecone_indexed === true,
      attempted: false
    };
    
    if (document.pinecone_indexed === true) {
      analysis = "Le document est correctement indexé dans Pinecone pour la recherche sémantique.";
    } else {
      analysis = "Le document n'est PAS indexé dans Pinecone.";
      
      // Analyser pourquoi
      if (!document.content || document.content.trim() === '') {
        analysis += " Le document n'a pas de contenu textuel.";
      } else if (document.content.length > 25000) {
        analysis += ` Le document est très volumineux (${document.content.length} caractères) ce qui peut causer des problèmes d'indexation.`;
      } else {
        analysis += " Une indexation avec Pinecone est recommandée.";
      }
    }
    
    console.log(`Analyse complète: ${analysis}`);
    
    return {
      success: true,
      analysis,
      pinecone: pineconeStatus,
      document: {
        id: document.id,
        title: document.title,
        type: document.type,
        size: document.size,
        contentLength: document.content?.length || 0
      }
    };
  } catch (error) {
    console.error("Erreur lors de l'analyse du document:", error);
    return {
      success: false,
      analysis: `Erreur lors de l'analyse: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};
