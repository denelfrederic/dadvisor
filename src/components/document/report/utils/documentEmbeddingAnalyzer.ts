
import { supabase } from "@/integrations/supabase/client";
import { forceGenerateEmbedding } from "@/components/chat/services/document/embeddingService";

/**
 * Analyse un document pour déterminer pourquoi il n'a pas d'embedding
 */
export const analyzeDocumentEmbeddingIssue = async (documentId: string): Promise<{
  documentInfo: any;
  analysis: string;
  canFix: boolean;
}> => {
  try {
    // Récupérer les informations complètes sur le document
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (error || !document) {
      return {
        documentInfo: null,
        analysis: `Erreur lors de la récupération du document: ${error?.message || 'Document non trouvé'}`,
        canFix: false
      };
    }
    
    // Analyser pourquoi le document n'a pas d'embedding
    let analysis = "";
    let canFix = false;
    
    // Vérifier si le document a du contenu
    if (!document.content || document.content.trim() === '') {
      analysis = "Le document n'a pas de contenu textuel extractible, impossible de générer un embedding.";
      canFix = false;
    } 
    // Vérifier si le contenu est un message d'erreur d'extraction
    else if (document.content.startsWith('[Document PDF:') && document.content.includes('Échec de l\'extraction')) {
      analysis = "L'extraction du texte du PDF a échoué lors du traitement initial. Une extraction améliorée peut être tentée.";
      canFix = true;
    }
    // Vérifier si le document est un PDF 
    else if (document.type === 'application/pdf') {
      analysis = "Le document est un PDF dont le texte n'a pas été correctement extrait ou est trop complexe pour un embedding standard. Un traitement optimisé avec une réduction significative du contenu peut être tenté.";
      canFix = true;
    }
    // Vérifier si le contenu est trop grand
    else if (document.content.length > 10000) {
      analysis = `Le document a un contenu très volumineux (${document.content.length} caractères) qui dépasse les limites de l'API d'embedding. Un embedding avec un texte tronqué à 6000 caractères peut être tenté.`;
      canFix = true;
    }
    // Autre cas
    else {
      analysis = "Le document a du contenu qui semble valide mais l'embedding n'a pas été généré, possiblement en raison d'une erreur temporaire ou d'un problème avec l'API d'embedding. Une nouvelle tentative peut être effectuée avec un modèle plus léger.";
      canFix = true;
    }
    
    return {
      documentInfo: {
        id: document.id,
        title: document.title,
        type: document.type,
        size: document.size,
        contentLength: document.content?.length || 0,
        contentPreview: document.content?.substring(0, 100) + '...' || 'Pas de contenu'
      },
      analysis,
      canFix
    };
  } catch (error) {
    return {
      documentInfo: null,
      analysis: `Exception lors de l'analyse: ${error instanceof Error ? error.message : String(error)}`,
      canFix: false
    };
  }
};

/**
 * Tente de réparer le document en générant un embedding avec des paramètres optimisés
 */
export const fixDocumentEmbedding = async (documentId: string): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const result = await forceGenerateEmbedding(documentId);
    
    if (result) {
      return {
        success: true,
        message: "Embedding généré avec succès en utilisant des paramètres optimisés"
      };
    } else {
      return {
        success: false,
        message: "Échec de la génération de l'embedding malgré les paramètres optimisés"
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Erreur lors de la tentative de réparation: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Analyse tous les documents sans embedding pour identifier les problèmes communs
 */
export const analyzeAllDocumentsWithoutEmbeddings = async (): Promise<{
  totalWithoutEmbedding: number;
  analyzedDocuments: any[];
  commonIssues: Record<string, number>;
}> => {
  try {
    // Récupérer tous les documents sans embedding
    const { data: documentsWithoutEmbedding, error } = await supabase
      .from('documents')
      .select('id, title, type, size, content')
      .is('embedding', null);
    
    if (error) {
      throw new Error(`Erreur lors de la récupération des documents: ${error.message}`);
    }
    
    if (!documentsWithoutEmbedding || documentsWithoutEmbedding.length === 0) {
      return {
        totalWithoutEmbedding: 0,
        analyzedDocuments: [],
        commonIssues: {}
      };
    }
    
    // Analyser chaque document
    const analyzedDocuments = documentsWithoutEmbedding.map(doc => {
      let issue = "Indéterminé";
      let canFix = true;
      
      // Absence de contenu
      if (!doc.content || doc.content.trim() === '') {
        issue = "Pas de contenu";
        canFix = false;
      }
      // Message d'erreur d'extraction
      else if (doc.content.startsWith('[Document PDF:') && doc.content.includes('Échec de l\'extraction')) {
        issue = "Échec d'extraction PDF";
        canFix = true;
      }
      // PDF 
      else if (doc.type === 'application/pdf') {
        issue = "PDF complexe";
        canFix = true;
      }
      // Contenu trop volumineux
      else if (doc.content.length > 10000) {
        issue = "Contenu trop volumineux";
        canFix = true;
      }
      // Fichier texte normal
      else if (doc.type.includes('text/')) {
        issue = "Échec d'embedding pour fichier texte";
        canFix = true;
      }
      
      return {
        id: doc.id,
        title: doc.title,
        type: doc.type,
        size: doc.size,
        contentLength: doc.content?.length || 0,
        issue,
        canFix
      };
    });
    
    // Compter les problèmes communs
    const commonIssues: Record<string, number> = {};
    analyzedDocuments.forEach(doc => {
      commonIssues[doc.issue] = (commonIssues[doc.issue] || 0) + 1;
    });
    
    return {
      totalWithoutEmbedding: documentsWithoutEmbedding.length,
      analyzedDocuments,
      commonIssues
    };
  } catch (error) {
    console.error("Erreur lors de l'analyse:", error);
    throw error;
  }
};
