
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
    
    // Analyser les statuts d'embedding et Pinecone
    let analysis = "";
    let pineconeStatus = {
      indexed: document.pinecone_indexed === true,
      attempted: false
    };
    
    // Si le document est marqué comme indexé dans Pinecone dans la base de données
    if (document.pinecone_indexed === true) {
      analysis = "Le document est marqué comme indexé dans Pinecone pour la recherche sémantique.";
      pineconeStatus.indexed = true;
    } else {
      // Vérifier si le document a un embedding
      if (!document.embedding) {
        analysis = "Le document n'a pas d'embedding et n'est PAS indexé dans Pinecone.";
      } else {
        // Document avec embedding mais pas encore marqué comme indexé dans Pinecone
        analysis = "Le document a un embedding mais n'est pas marqué comme indexé dans Pinecone.";
        
        // Option pour synchroniser: si un document a un embedding, proposer de le marquer comme indexé
        if (document.content) {
          if (document.content.length > 25000) {
            analysis += ` Le document est volumineux (${document.content.length} caractères) mais une synchronisation avec Pinecone est possible.`;
          } else {
            analysis += " Une synchronisation avec Pinecone est recommandée.";
          }
        }
      }
      
      pineconeStatus.indexed = false;
    }
    
    // Ajouter un message sur la possible désynchronisation avec Pinecone réel
    if (!pineconeStatus.indexed && document.embedding) {
      analysis += "\n\nRemarque: Ce document pourrait être déjà présent dans Pinecone mais marqué comme non-indexé dans la base locale. Une synchronisation est recommandée.";
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
        hasEmbedding: !!document.embedding,
        contentLength: document.content?.length || 0,
        needsSync: !document.pinecone_indexed && !!document.embedding
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
