
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useDocumentLoader = (documentId: string | null, isOpen: boolean) => {
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadDocument = useCallback(async () => {
    if (!documentId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();
      
      if (error) throw error;
      setDocument(data);
      
      // Vérifier si l'embedding est valide après rechargement
      if (data && (data.embedding || data.pinecone_indexed)) {
        console.log(`Document ${documentId} rechargé avec vectorisation`);
      } else {
        console.log(`Document ${documentId} rechargé sans vectorisation`);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du document:", error);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (isOpen && documentId) {
      loadDocument();
    } else {
      setDocument(null);
    }
  }, [isOpen, documentId, loadDocument]);

  return {
    document,
    loading,
    loadDocument
  };
};
