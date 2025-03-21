
/**
 * Service pour interagir avec Pinecone via les fonctions edge de Supabase
 */

import { supabase } from "@/integrations/supabase/client";
import { EmbeddableDocument } from "./types";
import { createEmbeddingLogger } from "./logger";

export const vectorizeDocument = async (
  document: EmbeddableDocument, 
  contentLength: number = 8000
) => {
  const logger = createEmbeddingLogger();
  const { addLog } = logger;
  
  if (!document || !document.content) {
    addLog(`Document invalide ou sans contenu: ${document?.id || 'inconnu'}`);
    throw new Error("Le document est vide ou n'a pas de contenu");
  }
  
  addLog(`Début de l'indexation Pinecone pour le document ${document.id} (${document.title})`);
  
  // Amélioration de la gestion des documents volumineux
  // Pour les documents très volumineux, prendre plus de contenu
  // Pour les documents extrêmement volumineux, découper en chunks (à implémenter dans une version future)
  let maxLength = contentLength;
  if (document.content.length > 20000) {
    // Pour les documents très volumineux, prendre plus de texte mais pas tout
    maxLength = 10000;
    addLog(`Document volumineux détecté (${document.content.length} caractères). Utilisation d'une longueur optimisée: ${maxLength}`);
  } else if (document.content.length > 8000) {
    // Pour les documents moyennement volumineux
    maxLength = 8000;
    addLog(`Document moyennement volumineux (${document.content.length} caractères). Utilisation de la longueur standard: ${maxLength}`);
  } else {
    // Pour les petits documents, prendre tout le contenu
    maxLength = document.content.length;
    addLog(`Petit document (${document.content.length} caractères). Utilisation du contenu complet`);
  }
  
  const truncatedContent = document.content.substring(0, maxLength);
  
  addLog(`Contenu préparé: ${truncatedContent.length}/${document.content.length} caractères`);
  
  try {
    // Ajouter un hook de détection de timeout
    const TIMEOUT = 30000; // 30 secondes
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      addLog(`La requête a expiré après ${TIMEOUT/1000} secondes`);
    }, TIMEOUT);
    
    // Appeler l'edge function Pinecone avec un timestamp pour éviter la mise en cache
    addLog("Appel à l'API Pinecone via l'edge function...");
    
    // Version compatible avec les types existants
    const { data: pineconeData, error: pineconeError } = await supabase.functions.invoke('pinecone-vectorize', {
      body: {
        action: 'vectorize',
        documentId: document.id,
        documentContent: truncatedContent,
        documentTitle: document.title,
        documentType: document.type,
        _timestamp: new Date().getTime(), // Éviter le cache
        documentSize: document.content.length // Ajouter la taille pour référence
      }
      // Nous n'utilisons pas signal ici pour maintenir la compatibilité avec les types existants
    });
    
    // Annuler le timeout manuellement
    clearTimeout(timeoutId);
    
    // Vérifier si la requête a été annulée manuellement
    if (controller.signal.aborted) {
      const timeoutMessage = `Timeout: La requête d'indexation a expiré après ${TIMEOUT/1000} secondes`;
      addLog(timeoutMessage);
      throw new Error(timeoutMessage);
    }
    
    if (pineconeError) {
      addLog(`Erreur lors de l'appel à l'API Pinecone: ${pineconeError.message}`);
      throw new Error(`Erreur lors de l'appel à l'API Pinecone: ${pineconeError.message}`);
    }
    
    if (!pineconeData || !pineconeData.success) {
      addLog(`Échec d'indexation avec Pinecone: ${pineconeData?.error || "Erreur inconnue"}`);
      throw new Error(pineconeData?.error || "Échec d'indexation avec Pinecone");
    }
    
    addLog(`Document indexé avec succès dans Pinecone`);
    
    return {
      success: true,
      embedding: pineconeData.embedding,
      logs: logger.logs
    };
  } catch (error) {
    // Assurer que toutes les erreurs sont correctement journalisées
    const errorMessage = error instanceof Error ? error.message : String(error);
    addLog(`Erreur finale d'indexation: ${errorMessage}`);
    console.error("Erreur d'indexation Pinecone:", error);
    
    // Tenter d'obtenir plus d'informations diagnostiques
    try {
      addLog("Tentative de test de connexion Pinecone...");
      const { data: testData } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { action: 'test-connection' }
      });
      
      if (testData) {
        if (testData.success) {
          addLog("Test de connexion réussi, le problème n'est pas lié à la connectivité");
        } else {
          addLog(`Échec du test de connexion: ${testData.message || "Raison inconnue"}`);
          if (testData.testedUrls) {
            addLog(`URLs testées: ${testData.testedUrls.join(", ")}`);
          }
        }
      }
    } catch (testError) {
      addLog(`Échec du test de connexion: ${testError instanceof Error ? testError.message : String(testError)}`);
    }
    
    throw error; // Relancer pour que la couche supérieure puisse la gérer
  }
};

export const updateDocumentStatus = async (documentId: string, embedding: any) => {
  try {
    console.log(`Mise à jour du statut du document ${documentId} dans Supabase...`);
    
    const { error } = await supabase
      .from('documents')
      .update({ 
        pinecone_indexed: true,
        embedding: embedding
      })
      .eq('id', documentId);
    
    if (error) {
      console.error(`Erreur lors de la mise à jour du statut: ${error.message}`);
      throw new Error(`Erreur lors de la mise à jour du document: ${error.message}`);
    }
    
    console.log(`Statut du document ${documentId} mis à jour avec succès`);
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    throw error;
  }
};
