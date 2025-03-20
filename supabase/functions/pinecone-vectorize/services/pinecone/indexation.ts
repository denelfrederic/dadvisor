
/**
 * Service d'indexation de documents dans Pinecone
 */

import { PINECONE_API_KEY, PINECONE_NAMESPACE } from "../../config.ts";
import { PINECONE_HEADERS, getPineconeOperationUrl } from "./config.ts";
import { generateEmbeddingWithOpenAI } from "../openai.ts";
import { logMessage, logError } from "../../utils/logging.ts";

/**
 * Index un document dans Pinecone
 * @param id ID du document
 * @param content Contenu du document
 * @param metadata Métadonnées du document
 * @returns Résultat de l'opération d'indexation
 */
export async function indexDocumentInPinecone(
  id: string,
  content: string,
  metadata: Record<string, any>
): Promise<any> {
  try {
    console.log(`Indexation du document ${id} dans Pinecone...`);
    
    // Génération d'embedding pour le document
    const embedding = await generateEmbeddingWithOpenAI(content);
    
    // Préparation du vecteur pour Pinecone
    const vector = {
      id,
      values: embedding,
      metadata: {
        ...metadata,
        text: content.substring(0, 1000) // Tronquer à 1000 caractères pour les métadonnées
      }
    };
    
    // Construction de l'URL d'upsert
    const upsertUrl = getPineconeOperationUrl('upsert');
    console.log(`URL d'upsert: ${upsertUrl}`);
    
    // Préparation du corps de la requête
    const requestBody = JSON.stringify({
      vectors: [vector],
      namespace: PINECONE_NAMESPACE
    });
    
    // Envoi de la requête à Pinecone
    console.log(`Envoi de la requête d'upsert à ${upsertUrl}...`);
    
    const response = await fetch(upsertUrl, {
      method: 'POST',
      headers: PINECONE_HEADERS,
      body: requestBody
    });
    
    // Traitement de la réponse
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur Pinecone pour upsert (${response.status}): ${errorText}`);
      
      // Diagnostic spécifique pour les erreurs courantes
      if (response.status === 403) {
        console.error("ERREUR 403: Accès refusé à Pinecone. Vérifiez votre clé API et les permissions.");
      } else if (response.status === 404) {
        console.error("ERREUR 404: Index Pinecone non trouvé. Vérifiez le nom de l'index dans la configuration.");
      } else if (response.status === 400) {
        console.error("ERREUR 400: Requête invalide. Vérifiez le format de vos données.");
      }
      
      throw new Error(`Erreur Pinecone: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`Document ${id} indexé avec succès:`, result);
    
    // Retourner l'embedding avec le résultat pour stocker dans Supabase également
    return {
      success: true,
      documentId: id,
      result,
      embedding: embedding,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Erreur lors de l'indexation du document ${id}:`, error);
    return {
      success: false,
      documentId: id,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
}
