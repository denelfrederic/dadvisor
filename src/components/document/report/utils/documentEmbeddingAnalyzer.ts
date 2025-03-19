
import { supabase } from "@/integrations/supabase/client";

export const analyzeDocumentEmbeddingIssue = async (documentId: string) => {
  try {
    console.log(`Analyse des problèmes d'embedding pour le document ${documentId}...`);
    
    // Récupérer le document
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (error) {
      console.error("Erreur lors de la récupération du document pour analyse:", error);
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
    
    // Analyser la présence d'embedding
    let analysis = "";
    let embeddings = {
      exists: false,
      type: "aucun",
      length: 0,
      quality: "inconnue",
    };
    
    let pineconeStatus = {
      indexed: document.pinecone_indexed === true,
      attempted: false
    };
    
    if (document.embedding) {
      embeddings.exists = true;
      
      if (typeof document.embedding === 'string') {
        // C'est un string JSON ou une représentation sérialisée
        embeddings.type = "string";
        embeddings.length = document.embedding.length;
        
        // Essayer de parser si c'est un JSON
        try {
          const parsed = JSON.parse(document.embedding);
          if (Array.isArray(parsed)) {
            embeddings.type = "array JSON";
            embeddings.length = parsed.length;
            embeddings.quality = parsed.length > 0 ? "valide" : "vide";
          }
        } catch (e) {
          // Ce n'est pas du JSON parsable
          embeddings.quality = "format inconnu";
        }
      } else if (Array.isArray(document.embedding)) {
        // C'est déjà un tableau
        embeddings.type = "array";
        embeddings.length = document.embedding.length;
        embeddings.quality = document.embedding.length > 0 ? "valide" : "vide";
      } else if (typeof document.embedding === 'object' && document.embedding !== null) {
        // C'est un objet - peut-être PgVector?
        embeddings.type = "objet";
        embeddings.quality = "format inconnu";
      }
      
      analysis = `Le document possède un embedding de type "${embeddings.type}" avec ${embeddings.length} éléments. Qualité: ${embeddings.quality}.`;
      
      if (document.pinecone_indexed) {
        analysis += " Le document est correctement indexé dans Pinecone pour la recherche sémantique.";
      } else {
        analysis += " Le document n'est PAS indexé dans Pinecone malgré la présence d'un embedding.";
      }
    } else {
      analysis = "Le document ne possède pas d'embedding.";
      
      // Analyser pourquoi
      if (!document.content || document.content.trim() === '') {
        analysis += " Le document n'a pas de contenu textuel.";
      } else if (document.content.length > 25000) {
        analysis += ` Le document est très volumineux (${document.content.length} caractères) ce qui peut causer des problèmes de génération d'embedding.`;
      } else {
        analysis += " Une tentative de génération d'embedding avec Pinecone est recommandée.";
      }
      
      if (document.pinecone_indexed === true) {
        analysis += " ATTENTION: Le document est marqué comme indexé dans Pinecone mais ne possède pas d'embedding local, ce qui est incohérent.";
      }
    }
    
    console.log(`Analyse complète: ${analysis}`);
    
    return {
      success: true,
      analysis,
      embeddings,
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
