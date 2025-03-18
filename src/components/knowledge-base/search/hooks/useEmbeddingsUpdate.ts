
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentEmbeddings } from "../../../chat/services/documentService";
import { supabase } from "@/integrations/supabase/client";
import { generateEntryEmbedding, processEntryForEmbedding } from "../../services/embedding/embeddingService";
import { prepareEmbeddingForStorage } from "../../services/embedding/embeddingUtils";

export const useEmbeddingsUpdate = () => {
  const [isUpdatingEmbeddings, setIsUpdatingEmbeddings] = useState(false);
  const { toast } = useToast();

  const updateExistingDocumentEmbeddings = async () => {
    setIsUpdatingEmbeddings(true);
    
    try {
      // Mettre à jour les embeddings des documents
      const docResult = await updateDocumentEmbeddings();
      
      // Mettre à jour les embeddings des entrées de connaissances
      const kbResult = await updateKnowledgeEntryEmbeddings();
      
      const totalUpdated = (docResult.count || 0) + (kbResult.count || 0);
      
      if (docResult.success && kbResult.success) {
        toast({
          title: "Mise à jour des embeddings",
          description: `${totalUpdated} élément(s) ont été mis à jour avec des embeddings vectoriels (${docResult.count} documents, ${kbResult.count} entrées KB).`,
          variant: "default"
        });
      } else {
        toast({
          title: "Erreur partielle",
          description: "Certains éléments n'ont pas pu être mis à jour avec des embeddings vectoriels.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des embeddings:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite lors de la mise à jour des embeddings.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingEmbeddings(false);
    }
  };

  const updateKnowledgeEntryEmbeddings = async (): Promise<{ success: boolean, count: number }> => {
    try {
      // Récupérer les entrées sans embedding
      const { data: entriesWithoutEmbedding, error: fetchError } = await supabase
        .from('knowledge_entries')
        .select('id, question, answer')
        .is('embedding', null);
      
      if (fetchError) {
        console.error("Erreur lors de la récupération des entrées sans embedding:", fetchError);
        return { success: false, count: 0 };
      }
      
      if (!entriesWithoutEmbedding || entriesWithoutEmbedding.length === 0) {
        console.log("Aucune entrée sans embedding trouvée.");
        return { success: true, count: 0 };
      }
      
      console.log(`${entriesWithoutEmbedding.length} entrées sans embedding trouvées, traitement...`);
      
      // Mettre à jour chaque entrée
      let successCount = 0;
      
      for (const entry of entriesWithoutEmbedding) {
        try {
          // Générer l'embedding
          const combinedText = processEntryForEmbedding(entry.question, entry.answer);
          const embedding = await generateEntryEmbedding(combinedText);
          
          if (embedding) {
            // Mettre à jour l'entrée
            const { error: updateError } = await supabase
              .from('knowledge_entries')
              .update({ 
                embedding: prepareEmbeddingForStorage(embedding) 
              })
              .eq('id', entry.id);
            
            if (updateError) {
              console.error(`Erreur lors de la mise à jour de l'embedding pour l'entrée ${entry.id}:`, updateError);
            } else {
              successCount++;
              console.log(`Entrée ${entry.id} mise à jour avec embedding.`);
            }
          }
        } catch (entryError) {
          console.error(`Erreur lors du traitement de l'entrée ${entry.id}:`, entryError);
        }
      }
      
      console.log(`${successCount}/${entriesWithoutEmbedding.length} entrées mises à jour avec succès.`);
      return { success: true, count: successCount };
    } catch (error) {
      console.error("Erreur lors de la mise à jour des embeddings des entrées:", error);
      return { success: false, count: 0 };
    }
  };

  return {
    isUpdatingEmbeddings,
    updateExistingDocumentEmbeddings
  };
};
