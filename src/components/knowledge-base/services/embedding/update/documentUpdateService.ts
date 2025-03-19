
import { supabase } from "@/integrations/supabase/client";

export const updateDocuments = async (
  onLog?: (message: string) => void
): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> => {
  try {
    onLog?.("Recherche des documents non indexés dans Pinecone...");
    
    // Récupérer les documents sans indexation Pinecone
    const { data: documents, error: fetchError } = await supabase
      .from('documents')
      .select('id, content, title, type')
      .eq('pinecone_indexed', false)
      .not('content', 'eq', '');
    
    if (fetchError) {
      const errorMsg = `Erreur lors de la récupération des documents: ${fetchError.message}`;
      onLog?.(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    if (!documents || documents.length === 0) {
      onLog?.("Aucun document à indexer trouvé.");
      return { success: true, count: 0 };
    }
    
    onLog?.(`${documents.length} documents à indexer trouvés.`);
    
    let successCount = 0;
    
    // Traiter chaque document
    for (const doc of documents) {
      try {
        onLog?.(`Indexation de "${doc.title}" (${doc.id.substring(0, 8)})...`);
        
        // Appeler la fonction edge Pinecone
        const { data: pineconeData, error: pineconeError } = await supabase.functions.invoke('pinecone-vectorize', {
          body: {
            action: 'vectorize',
            documentId: doc.id,
            documentContent: doc.content.substring(0, 8000), // Limiter la taille pour les gros documents
            documentTitle: doc.title,
            documentType: doc.type
          }
        });
        
        if (pineconeError) {
          onLog?.(`Erreur lors de l'appel à Pinecone pour ${doc.title}: ${pineconeError.message}`);
          continue;
        }
        
        if (!pineconeData.success) {
          onLog?.(`Échec de vectorisation pour ${doc.title}: ${pineconeData.error || 'Erreur inconnue'}`);
          continue;
        }
        
        // Marquer le document comme indexé dans Pinecone
        const { error: updateError } = await supabase
          .from('documents')
          .update({ 
            pinecone_indexed: true,
            embedding: pineconeData.embedding // Stocker l'embedding pour compatibilité
          })
          .eq('id', doc.id);
        
        if (updateError) {
          onLog?.(`Erreur lors de la mise à jour du document ${doc.title}: ${updateError.message}`);
          continue;
        }
        
        successCount++;
        onLog?.(`Document "${doc.title}" indexé avec succès!`);
      } catch (docError) {
        onLog?.(`Exception lors du traitement de ${doc.title}: ${docError instanceof Error ? docError.message : String(docError)}`);
      }
    }
    
    onLog?.(`Indexation terminée. ${successCount}/${documents.length} documents indexés avec succès.`);
    return { success: true, count: successCount };
  } catch (error) {
    const errorMsg = `Erreur lors de la mise à jour des documents: ${error instanceof Error ? error.message : String(error)}`;
    onLog?.(errorMsg);
    return { success: false, error: errorMsg };
  }
};

export const updateDocumentEmbeddings = updateDocuments;
