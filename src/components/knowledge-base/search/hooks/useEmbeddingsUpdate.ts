
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentEmbeddings } from "../../../chat/services/documentService";

export const useEmbeddingsUpdate = () => {
  const [isUpdatingEmbeddings, setIsUpdatingEmbeddings] = useState(false);
  const { toast } = useToast();

  const updateExistingDocumentEmbeddings = async () => {
    setIsUpdatingEmbeddings(true);
    
    try {
      const result = await updateDocumentEmbeddings();
      
      if (result.success) {
        toast({
          title: "Mise à jour des embeddings",
          description: `${result.count} document(s) ont été mis à jour avec des embeddings vectoriels.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la mise à jour des embeddings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des embeddings:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingEmbeddings(false);
    }
  };

  return {
    isUpdatingEmbeddings,
    updateExistingDocumentEmbeddings
  };
};
