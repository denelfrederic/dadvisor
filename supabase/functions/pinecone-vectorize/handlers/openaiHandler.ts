
import { checkOpenAIStatus, generateTestEmbedding } from "../services/openai.ts";
import { validateConfig, getPineconeIndex } from "../config.ts";
import { logMessage, logError } from "../utils/logging.ts";
import { corsedResponse } from "../utils/response.ts";

/**
 * Gestionnaire pour l'action de vérification OpenAI
 */
export async function handleOpenAICheckAction() {
  try {
    logMessage("Vérification de la configuration OpenAI...", 'info');
    const status = await checkOpenAIStatus();
    logMessage(`Statut OpenAI: ${status.success ? "OK" : "Erreur"}`, status.success ? 'info' : 'error');
    
    // Ajouter des informations sur Pinecone également
    const pineconeConfig = validateConfig();
    const effectiveIndex = getPineconeIndex();
    
    return corsedResponse({
      ...status,
      pineconeConfig: {
        ...pineconeConfig.config,
        effectiveIndex: effectiveIndex,
        warnings: pineconeConfig.warnings
      }
    });
  } catch (error) {
    const errorMsg = logError("Erreur lors de la vérification de la configuration OpenAI", error);
    return corsedResponse({ 
      success: false, 
      error: errorMsg
    }, 500);
  }
}

/**
 * Gestionnaire pour l'action de génération d'embedding
 */
export async function handleGenerateEmbeddingAction(body: any) {
  try {
    const { text } = body;
    
    if (!text) {
      logMessage("Texte manquant pour la génération d'embedding", 'error');
      return corsedResponse({ 
        success: false, 
        error: "Le texte est requis pour générer un embedding" 
      }, 400);
    }
    
    logMessage(`Génération de l'embedding pour le texte: "${text.substring(0, 30)}..."`, 'info');
    const result = await generateTestEmbedding(text);
    
    if (!result.success) {
      logMessage(`Échec de la génération d'embedding: ${result.error}`, 'error');
      return corsedResponse(result, 500);
    }
    
    logMessage("Embedding généré avec succès", 'info');
    return corsedResponse({ 
      success: true, 
      embedding: result.embedding,
      model: result.modelName,
      dimensions: result.embedding.length,
      usage: result.usage
    });
  } catch (error) {
    const errorMsg = logError("Erreur lors de la génération de l'embedding de test", error);
    return corsedResponse({ 
      success: false, 
      error: errorMsg
    }, 500);
  }
}
