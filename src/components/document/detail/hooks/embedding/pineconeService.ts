
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
  
  // Pour les documents volumineux, tronquer le contenu
  const maxLength = document.content.length > 15000 ? 6000 : contentLength;
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
    const { data: pineconeData, error: pineconeError } = await supabase.functions.invoke('pinecone-vectorize', {
      body: {
        action: 'vectorize',
        documentId: document.id,
        documentContent: truncatedContent,
        documentTitle: document.title,
        documentType: document.type,
        _timestamp: new Date().getTime() // Éviter le cache
      },
      signal: controller.signal
    });
    
    // Annuler le timeout si la requête a réussi
    clearTimeout(timeoutId);
    
    if (pineconeError) {
      // Gestion spécifique pour les erreurs de timeout
      if (pineconeError.message && pineconeError.message.includes("abort")) {
        const timeoutMessage = `Timeout: La requête d'indexation a expiré après ${TIMEOUT/1000} secondes`;
        addLog(timeoutMessage);
        addLog("Vérifiez l'état de l'edge function et des secrets configurés");
        
        // Vérifier l'état de configuration
        try {
          addLog("Tentative de diagnostic de configuration...");
          const { data: configData } = await supabase.functions.invoke('pinecone-vectorize', {
            body: { action: 'config' }
          });
          
          if (configData) {
            addLog(`Diagnostic: ${configData.valid ? "Configuration valide" : "Configuration invalide"}`);
            if (configData.warnings && configData.warnings.length > 0) {
              addLog("Problèmes détectés:");
              configData.warnings.forEach((warning: string) => addLog(`- ${warning}`));
            }
            
            // Vérifier les variables d'environnement critiques
            if (configData.envStatus) {
              const missingVars = [];
              for (const [key, value] of Object.entries(configData.envStatus)) {
                if (!value) missingVars.push(key);
              }
              
              if (missingVars.length > 0) {
                addLog(`Variables d'environnement manquantes: ${missingVars.join(", ")}`);
              }
            }
          }
        } catch (diagError) {
          addLog(`Échec du diagnostic: ${diagError instanceof Error ? diagError.message : String(diagError)}`);
        }
        
        throw new Error(timeoutMessage);
      }
      
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
