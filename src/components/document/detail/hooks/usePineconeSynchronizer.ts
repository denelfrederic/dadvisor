
/**
 * Hook pour synchroniser le statut d'indexation Pinecone d'un document
 * Permet de marquer un document comme indexé dans Pinecone sans réindexation
 */
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePineconeSynchronizer = () => {
  const [isSynchronizing, setIsSynchronizing] = useState(false);
  const { toast } = useToast();

  /**
   * Marque un document comme indexé dans Pinecone sans réindexation
   * Utile lorsqu'un document a un embedding mais n'est pas marqué comme indexé
   * @param documentId ID du document à synchroniser
   */
  const synchronizePineconeStatus = async (documentId: string) => {
    if (!documentId) return false;

    setIsSynchronizing(true);
    try {
      console.log(`Synchronisation du statut Pinecone pour le document ${documentId}...`);
      
      // Vérifier d'abord que le document a un embedding
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('id, title, embedding')
        .eq('id', documentId)
        .single();
        
      if (fetchError) {
        console.error("Erreur lors de la récupération du document:", fetchError);
        toast({
          title: "Erreur",
          description: `Erreur lors de la récupération du document: ${fetchError.message}`,
          variant: "destructive"
        });
        return false;
      }
      
      if (!document || !document.embedding) {
        console.error("Le document n'existe pas ou n'a pas d'embedding");
        toast({
          title: "Erreur",
          description: "Le document n'a pas d'embedding, impossible de synchroniser",
          variant: "destructive"
        });
        return false;
      }
      
      // Utiliser l'edge function en mode synchronisation
      const { data: syncData, error: syncError } = await supabase.functions.invoke('pinecone-vectorize', {
        body: {
          action: 'vectorize',
          documentId: documentId,
          documentContent: "content_placeholder", // Non utilisé en mode synchronisation
          documentTitle: document.title,
          skipIndexation: true,
          embedding: document.embedding,
          _timestamp: new Date().getTime() // Éviter le cache
        }
      });
      
      if (syncError) {
        console.error("Erreur lors de la synchronisation avec Pinecone:", syncError);
        toast({
          title: "Erreur",
          description: `Erreur lors de la synchronisation: ${syncError.message}`,
          variant: "destructive"
        });
        return false;
      }
      
      if (!syncData || !syncData.success) {
        console.error("Échec de la synchronisation Pinecone:", syncData?.error || "Raison inconnue");
        toast({
          title: "Erreur",
          description: syncData?.error || "Échec de la synchronisation",
          variant: "destructive"
        });
        return false;
      }
      
      // Mettre à jour le statut Pinecone du document
      const { error: updateError } = await supabase
        .from('documents')
        .update({ pinecone_indexed: true })
        .eq('id', documentId);
        
      if (updateError) {
        console.error("Erreur lors de la mise à jour du statut Pinecone:", updateError);
        toast({
          title: "Erreur",
          description: `Erreur lors de la mise à jour: ${updateError.message}`,
          variant: "destructive"
        });
        return false;
      }
      
      console.log(`Document ${documentId} marqué comme indexé dans Pinecone avec succès`);
      toast({
        title: "Succès",
        description: "Document marqué comme indexé dans Pinecone",
      });
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la synchronisation Pinecone:", error);
      toast({
        title: "Erreur",
        description: `Exception: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSynchronizing(false);
    }
  };

  /**
   * Synchronise tous les documents qui ont un embedding mais ne sont pas marqués comme indexés
   */
  const synchronizeAllDocuments = async () => {
    setIsSynchronizing(true);
    try {
      console.log("Recherche des documents avec embedding mais non indexés...");
      
      // Récupérer tous les documents qui ont un embedding mais ne sont pas marqués comme indexés
      const { data: documents, error: fetchError } = await supabase
        .from('documents')
        .select('id, title')
        .not('embedding', 'is', null)
        .eq('pinecone_indexed', false);
        
      if (fetchError) {
        console.error("Erreur lors de la récupération des documents:", fetchError);
        toast({
          title: "Erreur",
          description: `Erreur lors de la récupération des documents: ${fetchError.message}`,
          variant: "destructive"
        });
        return { success: false, count: 0 };
      }
      
      if (!documents || documents.length === 0) {
        console.log("Aucun document à synchroniser trouvé");
        toast({
          title: "Information",
          description: "Aucun document à synchroniser trouvé",
        });
        return { success: true, count: 0 };
      }
      
      console.log(`${documents.length} documents à synchroniser trouvés`);
      let successCount = 0;
      
      // Mettre à jour chaque document
      for (const doc of documents) {
        try {
          console.log(`Synchronisation du document ${doc.id} (${doc.title})...`);
          
          const success = await synchronizePineconeStatus(doc.id);
          if (success) {
            successCount++;
            console.log(`Document ${doc.id} (${doc.title}) synchronisé avec succès`);
          } else {
            console.error(`Échec de synchronisation du document ${doc.id} (${doc.title})`);
          }
        } catch (docError) {
          console.error(`Erreur lors de la synchronisation du document ${doc.id}:`, docError);
        }
      }
      
      const resultMsg = `${successCount}/${documents.length} documents synchronisés avec succès`;
      console.log(resultMsg);
      
      toast({
        title: "Synchronisation terminée",
        description: resultMsg
      });
      
      return { success: true, count: successCount };
    } catch (error) {
      console.error("Erreur lors de la synchronisation des documents:", error);
      toast({
        title: "Erreur",
        description: `Exception: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
      return { success: false, count: 0 };
    } finally {
      setIsSynchronizing(false);
    }
  };

  return {
    isSynchronizing,
    synchronizePineconeStatus,
    synchronizeAllDocuments
  };
};
