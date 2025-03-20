
import { indexDocumentInPinecone } from "../services/pinecone/index.ts";
import { getPineconeIndex, validateConfig } from "../config.ts";
import { logMessage, logError } from "../utils/logging.ts";
import { corsedResponse } from "../utils/response.ts";

/**
 * Gestionnaire pour l'action de vectorisation
 */
export async function handleVectorizeAction(body: any) {
  try {
    const { documentId, documentContent, documentTitle, documentType } = body;
    
    if (!documentId || !documentContent) {
      logMessage("Document ID ou contenu manquant", 'error');
      return corsedResponse({ 
        success: false, 
        error: "Document ID et contenu sont requis" 
      }, 400);
    }
    
    logMessage(`Indexation du document ${documentId}...`, 'info');
    logMessage(`Index Pinecone utilisé pour l'indexation: ${getPineconeIndex()}`, 'info');
    
    // Avant d'indexer, vérifier la configuration
    const configCheck = validateConfig();
    if (!configCheck.valid) {
      const errorDetails = `Configuration Pinecone invalide: ${configCheck.warnings.join("; ")}`;
      logMessage(errorDetails, 'error');
      return corsedResponse({
        success: false,
        error: errorDetails,
        config: configCheck.config,
        documentId
      }, 500);
    }
    
    const indexResult = await indexDocumentInPinecone(
      documentId, 
      documentContent,
      { title: documentTitle, type: documentType }
    );
    
    if (!indexResult.success) {
      logMessage(`Échec de l'indexation du document ${documentId}: ${indexResult.error}`, 'error');
      return corsedResponse(indexResult, 500);
    }
    
    logMessage(`Document ${documentId} indexé avec succès`, 'info');
    return corsedResponse({ 
      success: true, 
      message: "Document indexé avec succès dans Pinecone",
      embedding: indexResult.embedding
    });
  } catch (error) {
    const errorMsg = logError("Erreur lors de l'indexation du document dans Pinecone", error);
    return corsedResponse({ 
      success: false, 
      error: errorMsg
    }, 500);
  }
}
