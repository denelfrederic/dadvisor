
import { supabase } from "@/integrations/supabase/client";
import { DocumentForIndexing, LogCallback } from "./types";

/**
 * Vectorise un document et le met à jour dans Pinecone
 * @param doc Document à vectoriser
 * @param onLog Fonction de callback pour les logs
 * @returns True si réussi, false sinon
 */
export const vectorizeDocument = async (
  doc: DocumentForIndexing,
  onLog?: LogCallback
): Promise<boolean> => {
  try {
    const status = doc.pinecone_indexed ? "déjà indexé" : "non indexé";
    onLog?.(`Indexation de "${doc.title}" (${doc.id.substring(0, 8)}) - statut actuel: ${status}...`);
    
    // Tronquer le contenu pour les grands documents
    const contentLength = doc.content?.length || 0;
    const maxLength = contentLength > 15000 ? 6000 : 8000;
    const truncatedContent = doc.content.substring(0, maxLength);
    
    onLog?.(`Préparation du contenu (${truncatedContent.length}/${contentLength} caractères)...`);
    
    // Appeler la fonction edge Pinecone avec un timestamp pour éviter la mise en cache
    onLog?.("Appel à l'API Pinecone via l'edge function...");
    const { data: pineconeData, error: pineconeError } = await supabase.functions.invoke('pinecone-vectorize', {
      body: {
        action: 'vectorize',
        documentId: doc.id,
        documentContent: truncatedContent,
        documentTitle: doc.title,
        documentType: doc.type,
        _timestamp: new Date().getTime() // Éviter le cache
      }
    });
    
    if (pineconeError) {
      const errorMsg = `Erreur lors de l'appel à l'API Pinecone pour ${doc.title}: ${pineconeError.message}`;
      onLog?.(errorMsg);
      
      // Log détaillé pour diagnostic
      onLog?.(`Détails de l'erreur: ${JSON.stringify(pineconeError)}`);
      
      // Tentative de diagnostic de l'erreur 403
      if (pineconeError.message.includes("403") || (pineconeData && pineconeData.error && pineconeData.error.includes("403"))) {
        onLog?.("ERREUR 403 DÉTECTÉE: Problème d'autorisation avec Pinecone. Vérifiez que:");
        onLog?.("1. La clé API Pinecone est correctement configurée dans les secrets Supabase");
        onLog?.("2. L'index Pinecone existe et est accessible avec cette clé API");
        onLog?.("3. L'URL de l'API Pinecone est correcte et accessible");
      }
      
      return false;
    }
    
    if (!pineconeData || !pineconeData.success) {
      const errorMsg = `Échec de vectorisation pour ${doc.title}: ${pineconeData?.error || 'Erreur inconnue'}`;
      onLog?.(errorMsg);
      
      // Diagnostic pour les erreurs Pinecone
      if (pineconeData && pineconeData.error) {
        if (pineconeData.error.includes("Forbidden") || pineconeData.error.includes("403")) {
          onLog?.("ERREUR D'AUTORISATION: Accès refusé à Pinecone. Vérifiez les clés API et permissions.");
        } else if (pineconeData.error.includes("timeout") || pineconeData.error.includes("ETIMEDOUT")) {
          onLog?.("ERREUR DE TIMEOUT: Le serveur Pinecone n'a pas répondu à temps. Vérifiez la connectivité réseau.");
        } else if (pineconeData.error.includes("not found") || pineconeData.error.includes("404")) {
          onLog?.("ERREUR 404: Index Pinecone non trouvé. Vérifiez le nom de l'index dans la configuration.");
        }
      }
      
      return false;
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
      return false;
    }
    
    onLog?.(`Document "${doc.title}" indexé avec succès!`);
    return true;
  } catch (error) {
    const errorMsg = `Exception lors du traitement de ${doc.title}: ${error instanceof Error ? error.message : String(error)}`;
    onLog?.(errorMsg);
    return false;
  }
};
