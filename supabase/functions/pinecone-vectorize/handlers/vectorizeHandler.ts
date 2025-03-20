
import { indexDocumentInPinecone } from "../services/pinecone/index.ts";
import { getPineconeIndex, validateConfig, getPineconeUrl } from "../config.ts";
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
    
    // Information sur la configuration utilisée
    const pineconeUrl = getPineconeUrl();
    const pineconeIndex = getPineconeIndex();
    
    logMessage(`URL Pinecone utilisée: ${pineconeUrl}`, 'info');
    logMessage(`Index Pinecone utilisé pour l'indexation: ${pineconeIndex}`, 'info');
    
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
    
    // Nouvelle option: skipIndexation pour marquer un document comme indexé sans le réindexer
    const skipIndexation = body.skipIndexation === true && body.embedding !== undefined;
    
    if (skipIndexation) {
      logMessage(`Mode synchronisation activé pour le document ${documentId}, l'indexation dans Pinecone sera ignorée`, 'info');
      
      // Vérifier que l'embedding est valide
      if (!Array.isArray(body.embedding) || body.embedding.length === 0) {
        logMessage("Embedding invalide fourni pour le mode synchronisation", 'error');
        return corsedResponse({ 
          success: false, 
          error: "Embedding invalide pour le mode synchronisation" 
        }, 400);
      }
      
      // Retourner directement l'embedding fourni
      return corsedResponse({ 
        success: true, 
        message: "Document marqué comme indexé (mode synchronisation)",
        embedding: body.embedding
      });
    }
    
    // Mode normal: indexer le document dans Pinecone
    const indexResult = await indexDocumentInPinecone(
      documentId, 
      documentContent,
      { title: documentTitle, type: documentType }
    );
    
    if (!indexResult.success) {
      const errorMessage = indexResult.error || "Raison inconnue";
      logMessage(`Échec de l'indexation du document ${documentId}: ${errorMessage}`, 'error');
      
      // Retourner les détails de configuration pour le diagnostic côté client
      return corsedResponse({
        success: false,
        error: errorMessage,
        documentId: documentId,
        config: {
          pineconeUrl: pineconeUrl,
          pineconeIndex: pineconeIndex,
          ...configCheck.config
        },
        errorDetails: indexResult.errorDetails || {}
      }, 500);
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
      error: errorMsg,
      pineconeUrl: getPineconeUrl(),
      pineconeIndex: getPineconeIndex()
    }, 500);
  }
}
