
/**
 * Service d'indexation de documents dans Pinecone
 */

import { PINECONE_API_KEY, PINECONE_NAMESPACE, PINECONE_INDEX, getPineconeUrl } from "../../config.ts";
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
    const embeddingResult = await generateEmbeddingWithOpenAI(content);
    
    // S'assurer que l'embedding est un tableau de nombres (et non un objet ou une chaîne JSON)
    let embedding: number[];
    
    if (Array.isArray(embeddingResult)) {
      embedding = embeddingResult;
    } else if (typeof embeddingResult === 'string') {
      try {
        // Si c'est une chaîne JSON, la parser
        const parsed = JSON.parse(embeddingResult);
        if (Array.isArray(parsed)) {
          embedding = parsed;
        } else {
          throw new Error("L'embedding n'est pas un tableau après parsing");
        }
      } catch (parseError) {
        console.error("Erreur de parsing de l'embedding:", parseError);
        throw new Error(`Format d'embedding invalide: ${typeof embeddingResult}`);
      }
    } else {
      console.error("Type d'embedding inattendu:", typeof embeddingResult);
      throw new Error(`Format d'embedding non pris en charge: ${typeof embeddingResult}`);
    }
    
    // Vérification que l'embedding est bien un tableau de nombres
    if (!embedding.every(val => typeof val === 'number')) {
      console.error("L'embedding contient des valeurs non numériques:", embedding.slice(0, 5));
      throw new Error("L'embedding doit contenir uniquement des nombres");
    }
    
    console.log(`Embedding généré avec succès: ${embedding.length} dimensions`);
    
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
    const upsertUrl = getPineconeOperationUrl('vectors/upsert');
    const baseUrl = getPineconeUrl();
    const indexName = PINECONE_INDEX || "dadvisor";
    
    console.log(`URL Pinecone de base: ${baseUrl}`);
    console.log(`Index utilisé: ${indexName}`);
    console.log(`URL d'upsert: ${upsertUrl}`);
    
    // Log détaillé du format des données
    console.log(`Format de l'ID: ${typeof id}`);
    console.log(`Format des values: ${typeof embedding}, est un tableau: ${Array.isArray(embedding)}, longueur: ${embedding.length}`);
    console.log(`Exemple des premières valeurs: ${embedding.slice(0, 5).join(', ')}`);
    
    // Préparation du corps de la requête
    const requestBody = JSON.stringify({
      vectors: [
        {
          id,
          values: embedding,
          metadata: {
            ...metadata,
            text: content.substring(0, 1000)
          }
        }
      ],
      namespace: PINECONE_NAMESPACE
    });
    
    // Envoi de la requête à Pinecone
    console.log(`Envoi de la requête d'upsert à ${upsertUrl}...`);
    
    try {
      const response = await fetch(upsertUrl, {
        method: 'POST',
        headers: PINECONE_HEADERS,
        body: requestBody,
        // Augmenter le timeout pour les grandes charges
        signal: AbortSignal.timeout(30000) // 30 secondes de timeout
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
          console.error(`Index configuré: "${indexName}"`);
          console.error(`URL complète utilisée: ${upsertUrl}`);
          
          // Tenter d'extraire le vrai nom de l'index à partir de l'URL
          try {
            // Pour une URL de type: https://dadvisor-xpcwv7u.svc.aped-4627-b74a.pinecone.io
            // le vrai index est souvent la partie avant le premier tiret (dadvisor)
            const urlObj = new URL(baseUrl);
            const hostname = urlObj.hostname;
            const potentialIndex = hostname.split('.')[0];
            let suggestedIndex = potentialIndex;
            
            // Si le hostname contient un tiret, le vrai index est souvent ce qui précède le premier tiret
            if (potentialIndex.includes('-')) {
              suggestedIndex = potentialIndex.split('-')[0];
            }
            
            if (suggestedIndex !== indexName) {
              console.error(`SUGGESTION: Essayez d'utiliser "${suggestedIndex}" comme nom d'index au lieu de "${indexName}"`);
            }
          } catch (err) {
            console.error("Impossible d'analyser l'URL pour suggérer un index");
          }
        } else if (response.status === 400) {
          console.error("ERREUR 400: Requête invalide. Vérifiez le format de vos données.");
          console.error("Payload envoyé:", requestBody.substring(0, 500) + "...");
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
    } catch (fetchError) {
      console.error(`Erreur lors de la requête Pinecone: ${fetchError}`);
      
      // Diagnostics supplémentaires pour les erreurs de réseau
      if (fetchError instanceof TypeError && fetchError.message.includes("fetch failed")) {
        console.error("Erreur réseau: Impossible d'atteindre le serveur Pinecone");
        console.error("Vérifiez que l'URL est correcte et que le service est accessible");
      }
      
      // Si l'erreur semble liée à l'URL, essayer de fournir plus d'informations
      const errorMsg = fetchError instanceof Error ? fetchError.message : String(fetchError);
      if (errorMsg.includes("404") || errorMsg.includes("not found")) {
        console.error("ERREUR 404 DÉTECTÉE: L'URL semble incorrecte ou l'index n'existe pas");
        console.error(`URL utilisée: ${upsertUrl}`);
        console.error(`Index configuré: "${indexName}"`);
        console.error("Vérifiez que l'URL et l'index correspondent exactement à ce qui est dans la console Pinecone");
      }
      
      // Retourner quand même l'embedding pour que le document puisse être marqué comme indexé
      // dans Supabase même si Pinecone a échoué
      return {
        success: false,
        documentId: id,
        embedding: embedding,
        error: `Erreur Pinecone: ${errorMsg}`,
        errorDetails: {
          message: errorMsg,
          url: upsertUrl,
          index: indexName,
          namespace: PINECONE_NAMESPACE
        },
        timestamp: new Date().toISOString()
      };
    }
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
