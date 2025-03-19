
import { useState, useCallback, useEffect } from "react";
import { analyzeDocumentEmbeddingIssue } from "../../report/utils/documentEmbeddingAnalyzer";

export const useDocumentAnalyzer = (documentId: string | null, isOpen: boolean) => {
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeDocument = useCallback(async () => {
    if (!documentId) return;
    
    try {
      const result = await analyzeDocumentEmbeddingIssue(documentId);
      setAnalysis(result);
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
