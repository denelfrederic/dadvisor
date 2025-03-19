
import { useState, useCallback, useEffect } from "react";
import { analyzeDocumentEmbeddingIssue } from "../../report/utils/documentEmbeddingAnalyzer";
import { supabase } from "@/integrations/supabase/client";

export const useDocumentAnalyzer = (documentId: string | null, isOpen: boolean) => {
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeDocument = useCallback(async () => {
    if (!documentId) return;
    
    try {
      console.log(`Analyse du document ${documentId}...`);
      
      // Vérifier d'abord l'état d'indexation Pinecone
      const { data: document, error: documentError } = await supabase
        .from('documents')
        .select('pinecone_indexed, embedding')
        .eq('id', documentId)
        .single();
        
      if (documentError) {
        console.error("Erreur lors de la vérification de l'indexation Pinecone:", documentError);
        throw documentError;
      }
      
      // Analyser les résultats
      let pineconeStatus = "non déterminé";
      
      if (document) {
        if (document.pinecone_indexed === true) {
          pineconeStatus = "indexé";
          console.log(`Document ${documentId} est indexé dans Pinecone`);
        } else {
          pineconeStatus = "non indexé";
          console.log(`Document ${documentId} n'est PAS indexé dans Pinecone`);
        }
      }
      
      // Poursuivre avec l'analyse standard
      const result = await analyzeDocumentEmbeddingIssue(documentId);
      
      // Ajouter les informations Pinecone à l'analyse
      const enhancedResult = {
        ...result,
        pinecone: {
          status: pineconeStatus,
          indexed: document?.pinecone_indexed === true,
        }
      };
      
      console.log("Analyse complète:", enhancedResult);
      setAnalysis(enhancedResult);
    } catch (error) {
      console.error("Erreur lors de l'analyse du document:", error);
    }
  }, [documentId]);

  useEffect(() => {
    if (isOpen && documentId) {
      analyzeDocument();
    } else {
      setAnalysis(null);
    }
  }, [isOpen, documentId, analyzeDocument]);

  return {
    analysis,
    analyzeDocument
  };
};
