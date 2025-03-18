
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { updateDocumentEmbeddings } from "../../../chat/services/document/documentProcessor";
import { generateEmbedding } from "../../../chat/services/document/embeddingService";
import { prepareEmbeddingForStorage } from "../../services/embedding/embeddingUtils";

export const useEmbeddingsUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = useCallback((message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  }, []);

  const updateDocumentEmbeddingsWithProgress = useCallback(async () => {
    setIsUpdating(true);
    setProgress(0);
    addLog("Début de la mise à jour des embeddings des documents...");
    
    try {
      const result = await updateDocumentEmbeddings();
      
      if (result.success) {
        addLog(`${result.count} documents mis à jour avec succès.`);
        setProgress(100);
        toast({
          title: "Mise à jour terminée",
          description: `${result.count} documents ont été enrichis avec des embeddings.`
        });
      } else {
        addLog("Échec de la mise à jour des embeddings des documents.");
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour des embeddings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      addLog(`Erreur: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour des embeddings.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  }, [addLog, toast]);

  const updateKnowledgeEntryEmbeddings = useCallback(async () => {
    setIsUpdating(true);
    setProgress(0);
    addLog("Début de la mise à jour des embeddings des entrées de connaissances...");
    
    try {
      // Récupérer les entrées sans embedding
      const { data: entriesWithoutEmbedding, error: fetchError } = await supabase
        .from('knowledge_entries')
        .select('id, question, answer')
        .is('embedding', null);
      
      if (fetchError) {
        throw new Error(`Erreur lors de la récupération des entrées: ${fetchError.message}`);
      }
      
      if (!entriesWithoutEmbedding || entriesWithoutEmbedding.length === 0) {
        addLog("Aucune entrée sans embedding trouvée.");
        setProgress(100);
        return;
      }
      
      addLog(`${entriesWithoutEmbedding.length} entrées sans embedding trouvées, traitement...`);
      let successCount = 0;
      
      for (let i = 0; i < entriesWithoutEmbedding.length; i++) {
        const entry = entriesWithoutEmbedding[i];
        setProgress(Math.floor((i / entriesWithoutEmbedding.length) * 100));
        
        try {
          // Combiner question et réponse pour l'embedding
          const textToEmbed = `${entry.question}\n${entry.answer}`;
          
          // Générer l'embedding
          const embedding = await generateEmbedding(textToEmbed);
          
          if (!embedding) {
            addLog(`Échec de génération d'embedding pour l'entrée ${entry.id}`);
            continue;
          }
          
          // Préparer l'embedding pour le stockage
          const embeddingForStorage = prepareEmbeddingForStorage(embedding);
          
          // Mettre à jour l'entrée
          const { error: updateError } = await supabase
            .from('knowledge_entries')
            .update({ embedding: embeddingForStorage })
            .eq('id', entry.id);
          
          if (updateError) {
            addLog(`Erreur lors de la mise à jour de l'entrée ${entry.id}: ${updateError.message}`);
          } else {
            successCount++;
            addLog(`Entrée ${entry.id} mise à jour avec embedding.`);
          }
        } catch (entryError) {
          addLog(`Erreur lors du traitement de l'entrée ${entry.id}: ${entryError instanceof Error ? entryError.message : String(entryError)}`);
        }
      }
      
      setProgress(100);
      addLog(`${successCount}/${entriesWithoutEmbedding.length} entrées mises à jour avec succès.`);
      
      toast({
        title: "Mise à jour terminée",
        description: `${successCount} entrées de connaissances ont été enrichies avec des embeddings.`
      });
    } catch (error) {
      addLog(`Erreur globale: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour des embeddings.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  }, [addLog, toast]);

  // Function to update both document and knowledge entry embeddings
  const updateAllEmbeddings = useCallback(async () => {
    setIsUpdating(true);
    setProgress(0);
    addLog("Début de la mise à jour de tous les embeddings (documents et base de connaissances)...");
    
    try {
      // Update document embeddings
      addLog("Mise à jour des embeddings des documents...");
      const docResult = await updateDocumentEmbeddings();
      
      if (docResult.success) {
        addLog(`${docResult.count} documents mis à jour avec succès.`);
      } else {
        addLog("Échec de la mise à jour des embeddings des documents.");
      }
      
      setProgress(50); // Set progress to 50% after documents
      
      // Update knowledge entries embeddings
      addLog("Mise à jour des embeddings des entrées de connaissances...");
      
      // Récupérer les entrées sans embedding
      const { data: entriesWithoutEmbedding, error: fetchError } = await supabase
        .from('knowledge_entries')
        .select('id, question, answer')
        .is('embedding', null);
      
      if (fetchError) {
        throw new Error(`Erreur lors de la récupération des entrées: ${fetchError.message}`);
      }
      
      if (!entriesWithoutEmbedding || entriesWithoutEmbedding.length === 0) {
        addLog("Aucune entrée sans embedding trouvée.");
      } else {
        addLog(`${entriesWithoutEmbedding.length} entrées sans embedding trouvées, traitement...`);
        let successCount = 0;
        
        for (let i = 0; i < entriesWithoutEmbedding.length; i++) {
          const entry = entriesWithoutEmbedding[i];
          setProgress(50 + Math.floor((i / entriesWithoutEmbedding.length) * 50)); // From 50% to 100%
          
          try {
            // Combiner question et réponse pour l'embedding
            const textToEmbed = `${entry.question}\n${entry.answer}`;
            
            // Générer l'embedding
            const embedding = await generateEmbedding(textToEmbed);
            
            if (!embedding) {
              addLog(`Échec de génération d'embedding pour l'entrée ${entry.id}`);
              continue;
            }
            
            // Préparer l'embedding pour le stockage
            const embeddingForStorage = prepareEmbeddingForStorage(embedding);
            
            // Mettre à jour l'entrée
            const { error: updateError } = await supabase
              .from('knowledge_entries')
              .update({ embedding: embeddingForStorage })
              .eq('id', entry.id);
            
            if (updateError) {
              addLog(`Erreur lors de la mise à jour de l'entrée ${entry.id}: ${updateError.message}`);
            } else {
              successCount++;
              addLog(`Entrée ${entry.id} mise à jour avec embedding.`);
            }
          } catch (entryError) {
            addLog(`Erreur lors du traitement de l'entrée ${entry.id}: ${entryError instanceof Error ? entryError.message : String(entryError)}`);
          }
        }
        
        addLog(`${successCount}/${entriesWithoutEmbedding.length} entrées mises à jour avec succès.`);
      }
      
      setProgress(100);
      toast({
        title: "Mise à jour terminée",
        description: `Mise à jour des embeddings terminée pour documents et entrées de connaissances.`
      });
    } catch (error) {
      addLog(`Erreur globale: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour des embeddings.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  }, [addLog, toast]);

  return {
    isUpdating,
    progress,
    logs,
    updateDocumentEmbeddings: updateDocumentEmbeddingsWithProgress,
    updateKnowledgeEntryEmbeddings,
    updateAllEmbeddings
  };
};
