
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
    
    // Récupérer d'abord le nombre total de documents
    const { count: totalCount, error: countError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      const errorMsg = `Erreur lors du comptage des documents: ${countError.message}`;
      onLog?.(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    onLog?.(`Nombre total de documents: ${totalCount || 0}`);
    
    // Récupérer les documents sans indexation Pinecone
    // Modifié pour inclure ceux avec pinecone_indexed à NULL ou FALSE
    const { data: documents, error: fetchError } = await supabase
      .from('documents')
      .select('id, content, title, type, pinecone_indexed')
      .or('pinecone_indexed.is.null,pinecone_indexed.eq.false')
      .not('content', 'is', null)
      .not('content', 'eq', '');
    
    if (fetchError) {
      const errorMsg = `Erreur lors de la récupération des documents: ${fetchError.message}`;
      onLog?.(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    if (!documents || documents.length === 0) {
      onLog?.("Aucun document à indexer trouvé.");
      
      // Vérification supplémentaire avec des détails SQL
      const { data: checkData, error: checkError } = await supabase
        .from('documents')
        .select('id, title, pinecone_indexed')
        .limit(5);
      
      if (!checkError && checkData && checkData.length > 0) {
        onLog?.(`Les 5 premiers documents dans la base:`);
        for (const doc of checkData) {
          onLog?.(`- Document "${doc.title}" (${doc.id.substring(0, 8)}): pinecone_indexed = ${doc.pinecone_indexed === null ? 'NULL' : doc.pinecone_indexed}`);
        }
      }
      
      return { success: true, count: 0 };
    }
    
    onLog?.(`${documents.length} documents à indexer trouvés.`);
    
    // Afficher les premiers documents trouvés
    const sampleSize = Math.min(3, documents.length);
    if (sampleSize > 0) {
      onLog?.(`Aperçu des ${sampleSize} premiers documents à indexer:`);
      for (let i = 0; i < sampleSize; i++) {
        const doc = documents[i];
        onLog?.(`- Document "${doc.title}" (${doc.id.substring(0, 8)}): ${doc.content?.length || 0} caractères`);
      }
    }
    
    let successCount = 0;
    let errorDetails = [];
    
    // Traiter chaque document
    for (const doc of documents) {
      try {
        onLog?.(`Indexation de "${doc.title}" (${doc.id.substring(0, 8)})...`);
        
        // Tronquer le contenu pour les grands documents
        const contentLength = doc.content?.length || 0;
        const maxLength = contentLength > 15000 ? 6000 : 8000;
        const truncatedContent = doc.content.substring(0, maxLength);
        
        onLog?.(`Préparation du contenu (${truncatedContent.length}/${contentLength} caractères)...`);
        
        // Appeler la fonction edge Pinecone
        const { data: pineconeData, error: pineconeError } = await supabase.functions.invoke('pinecone-vectorize', {
          body: {
            action: 'vectorize',
            documentId: doc.id,
            documentContent: truncatedContent,
            documentTitle: doc.title,
            documentType: doc.type,
            _timestamp: new Date().getTime() // Éviter la mise en cache
          }
        });
        
        if (pineconeError) {
          const errorMsg = `Erreur lors de l'appel à Pinecone pour ${doc.title}: ${pineconeError.message}`;
          onLog?.(errorMsg);
          errorDetails.push(errorMsg);
          continue;
        }
        
        if (!pineconeData || !pineconeData.success) {
          const errorMsg = `Échec de vectorisation pour ${doc.title}: ${pineconeData?.error || 'Erreur inconnue'}`;
          onLog?.(errorMsg);
          errorDetails.push(errorMsg);
          continue;
        }
        
        onLog?.(`Vectorisation réussie, mise à jour du document dans Supabase...`);
        
        // Marquer le document comme indexé dans Pinecone
        const { error: updateError } = await supabase
          .from('documents')
          .update({ 
            pinecone_indexed: true,
            embedding: pineconeData.embedding // Stocker l'embedding pour compatibilité
          })
          .eq('id', doc.id);
        
        if (updateError) {
          const errorMsg = `Erreur lors de la mise à jour du document ${doc.title}: ${updateError.message}`;
          onLog?.(errorMsg);
          errorDetails.push(errorMsg);
          continue;
        }
        
        successCount++;
        onLog?.(`Document "${doc.title}" indexé avec succès!`);
      } catch (docError) {
        const errorMsg = `Exception lors du traitement de ${doc.title}: ${docError instanceof Error ? docError.message : String(docError)}`;
        onLog?.(errorMsg);
        errorDetails.push(errorMsg);
      }
    }
    
    const summaryMsg = `Indexation terminée. ${successCount}/${documents.length} documents indexés avec succès.`;
    onLog?.(summaryMsg);
    
    if (successCount === 0 && errorDetails.length > 0) {
      return { 
        success: false, 
        count: successCount,
        error: `Aucun document n'a pu être indexé. Erreur principale: ${errorDetails[0]}`
      };
    }
    
    return { success: true, count: successCount };
  } catch (error) {
    const errorMsg = `Erreur lors de la mise à jour des documents: ${error instanceof Error ? error.message : String(error)}`;
    onLog?.(errorMsg);
    return { success: false, error: errorMsg };
  }
};

export const updateDocumentEmbeddings = updateDocuments;
