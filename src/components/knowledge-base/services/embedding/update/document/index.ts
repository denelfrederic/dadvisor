
import { DocumentUpdateResult, LogCallback } from "./types";
import { processDocuments } from "./processingService";

/**
 * Fonction principale pour mettre à jour les embeddings des documents
 * @param onLog Fonction de callback pour les logs
 * @param forceReindex Si true, réindexe tous les documents, même ceux déjà indexés
 * @returns Résultat de l'opération
 */
export const updateDocuments = async (
  onLog?: LogCallback,
  forceReindex = false
): Promise<DocumentUpdateResult> => {
  try {
    onLog?.("Vérification de la configuration...");
    return await processDocuments(onLog, forceReindex);
  } catch (error) {
    const errorMsg = `Erreur lors de la mise à jour des documents: ${error instanceof Error ? error.message : String(error)}`;
    onLog?.(errorMsg);
    return { success: false, error: errorMsg };
  }
};

// Export pour compatibilité avec l'ancienne API
export const updateDocumentEmbeddings = updateDocuments;

// Export tous les sous-modules pour permettre un accès direct si nécessaire
export * from "./types";
export * from "./documentFetcher";
export * from "./vectorizationService";
export * from "./processingService";
