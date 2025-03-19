
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
      
      // Tentative de diagnostic plus précise pour les erreurs edge function
      if (pineconeError.message.includes("Edge Function") || pineconeError.message.includes("non-2xx status code")) {
        onLog?.("ERREUR EDGE FUNCTION: Problème avec la fonction Pinecone-vectorize.");
        onLog?.("Cette erreur peut être due à:");
        onLog?.("1. Une erreur 403 Forbidden renvoyée par Pinecone (quota dépassé ou plan gratuit en pause)");
        onLog?.("2. Un problème de configuration dans les variables d'environnement de la fonction edge");
        onLog?.("3. Un problème temporaire avec l'API Pinecone");
        
        // Détection spécifique du quota des plans gratuits
        onLog?.("Si vous utilisez un plan gratuit Pinecone, il est possible que:");
        onLog?.("- Votre index soit en pause (après une période d'inactivité)");
        onLog?.("- Vous ayez atteint la limite de requêtes de votre plan");
        onLog?.("- Votre index soit encore en cours de démarrage");
        onLog?.("Conseil: Patientez quelques minutes et réessayez, ou vérifiez l'état de votre index dans la console Pinecone");
      }
      
      return false;
    }
    
    if (!pineconeData || !pineconeData.success) {
      const errorMsg = `Échec de vectorisation pour ${doc.title}: ${pineconeData?.error || 'Erreur inconnue'}`;
      onLog?.(errorMsg);
      
      // Diagnostic pour les erreurs Pinecone
      if (pineconeData && pineconeData.error) {
        if (pineconeData.error.includes("Forbidden") || pineconeData.error.includes("403")) {
          onLog?.("ERREUR D'AUTORISATION (403): Accès refusé à Pinecone.");
          onLog?.("Causes possibles:");
          onLog?.("1. Clé API invalide ou insuffisante");
          onLog?.("2. Quota dépassé (plan gratuit)");
          onLog?.("3. Index en pause ou en cours de démarrage");
          onLog?.("4. Restriction IP (peu probable)");
          onLog?.("Conseil: Vérifiez l'état de votre index dans la console Pinecone et patientez quelques minutes avant de réessayer");
        } else if (pineconeData.error.includes("timeout") || pineconeData.error.includes("ETIMEDOUT")) {
          onLog?.("ERREUR DE TIMEOUT: Le serveur Pinecone n'a pas répondu à temps.");
          onLog?.("Cela peut être dû à:");
          onLog?.("1. Un index en cours de démarrage (plan gratuit)");
          onLog?.("2. Une surcharge temporaire du service Pinecone"); 
          onLog?.("3. Un problème de connectivité réseau");
          onLog?.("Conseil: Patientez quelques minutes et réessayez");
        } else if (pineconeData.error.includes("not found") || pineconeData.error.includes("404")) {
          onLog?.("ERREUR 404: Index Pinecone non trouvé.");
          onLog?.("Vérifiez le nom de l'index dans la configuration (actuellement: " + (pineconeData.indexName || "non spécifié") + ")");
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
