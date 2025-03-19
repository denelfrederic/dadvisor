
import { DocumentForIndexing, DocumentUpdateResult, LogCallback } from "./types";
import { fetchDocumentsForIndexing, analyzeNoDocumentsFound } from "./documentFetcher";
import { vectorizeDocument } from "./vectorizationService";

/**
 * Traite les documents pour indexation dans Pinecone
 * @param onLog Fonction de callback pour les logs
 * @param forceReindex Si true, traite tous les documents, même ceux déjà indexés
 * @returns Résultat de l'opération
 */
export const processDocuments = async (
  onLog?: LogCallback,
  forceReindex = false
): Promise<DocumentUpdateResult> => {
  try {
    // Récupération des documents à indexer
    const documents = await fetchDocumentsForIndexing(onLog, forceReindex);
    
    if (!documents || documents.length === 0) {
      onLog?.("Aucun document à indexer trouvé.");
      await analyzeNoDocumentsFound(onLog, forceReindex);
      return { success: true, count: 0 };
    }
    
    onLog?.(`${documents.length} documents à indexer trouvés.`);
    
    // Afficher les premiers documents trouvés
    const sampleSize = Math.min(3, documents.length);
    if (sampleSize > 0) {
      onLog?.(`Aperçu des ${sampleSize} premiers documents à indexer:`);
      for (let i = 0; i < sampleSize; i++) {
        const doc = documents[i];
        const status = doc.pinecone_indexed ? "déjà indexé" : "non indexé";
        onLog?.(`- Document "${doc.title}" (${doc.id.substring(0, 8)}): ${doc.content?.length || 0} caractères, statut: ${status}`);
      }
    }
    
    let successCount = 0;
    let errorDetails: string[] = [];
    
    // Traiter chaque document
    for (const doc of documents) {
      const success = await vectorizeDocument(doc, onLog);
      if (success) {
        successCount++;
      }
    }
    
    const summaryMsg = `Indexation terminée. ${successCount}/${documents.length} documents indexés avec succès.`;
    onLog?.(summaryMsg);
    
    if (successCount === 0 && documents.length > 0) {
      return { 
        success: false, 
        count: 0,
        error: `Aucun document n'a pu être indexé. Vérifiez les logs pour plus de détails.`
      };
    }
    
    return { success: true, count: successCount };
  } catch (error) {
    const errorMsg = `Erreur lors de la mise à jour des documents: ${error instanceof Error ? error.message : String(error)}`;
    onLog?.(errorMsg);
    return { success: false, error: errorMsg };
  }
};
