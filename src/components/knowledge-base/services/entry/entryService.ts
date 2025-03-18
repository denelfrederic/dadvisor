
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeEntry } from "../../types";
import { generateEntryEmbedding, processEntryForEmbedding } from "../embedding/embeddingService";
import { parseEmbedding, prepareEmbeddingForStorage } from "../embedding/embeddingUtils";

/**
 * Service for managing basic CRUD operations on knowledge entries
 */
export const useEntryService = () => {
  const { toast } = useToast();

  /**
   * Add a new entry to the knowledge base
   */
  const addEntry = async (entry: Omit<KnowledgeEntry, 'id'>): Promise<KnowledgeEntry | null> => {
    try {
      console.log("Adding new knowledge entry:", entry);
      
      // Generate embedding for the entry if possible
      const combinedText = processEntryForEmbedding(entry.question, entry.answer);
      const embedding = await generateEntryEmbedding(combinedText);
      
      const insertData: any = {
        question: entry.question,
        answer: entry.answer,
        source: entry.source || "User input",
      };
      
      // Only add embedding if it was successfully generated
      if (embedding) {
        insertData.embedding = prepareEmbeddingForStorage(embedding);
      }
      
      const { data, error } = await supabase
        .from('knowledge_entries')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error("Error adding knowledge entry:", error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter l'entrée à la base de connaissances",
          variant: "destructive"
        });
        return null;
      }
      
      console.log("Knowledge entry added successfully:", data);
      
      // Ensure embedding is properly parsed
      if (data.embedding) {
        data.embedding = parseEmbedding(data.embedding);
      }
      
      return data as KnowledgeEntry;
    } catch (error) {
      console.error("Exception while adding knowledge entry:", error);
      return null;
    }
  };

  /**
   * Update an existing entry in the knowledge base
   */
  const updateEntry = async (id: string, entry: Partial<KnowledgeEntry>): Promise<boolean> => {
    try {
      console.log("Updating knowledge entry:", id, entry);
      
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      // Only include fields that were provided in the update
      if (entry.question !== undefined) updateData.question = entry.question;
      if (entry.answer !== undefined) updateData.answer = entry.answer;
      if (entry.source !== undefined) updateData.source = entry.source;
      
      // If question or answer was updated, regenerate the embedding
      if (entry.question !== undefined || entry.answer !== undefined) {
        // First get the current entry to combine with updates
        const { data: currentEntry } = await supabase
          .from('knowledge_entries')
          .select('question, answer')
          .eq('id', id)
          .single();
          
        if (currentEntry) {
          const question = entry.question || currentEntry.question;
          const answer = entry.answer || currentEntry.answer;
          const combinedText = processEntryForEmbedding(question, answer);
          
          const embedding = await generateEntryEmbedding(combinedText);
          if (embedding) {
            updateData.embedding = prepareEmbeddingForStorage(embedding);
          }
        }
      }
      
      const { error } = await supabase
        .from('knowledge_entries')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        console.error("Error updating knowledge entry:", error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour l'entrée",
          variant: "destructive"
        });
        return false;
      }
      
      console.log("Knowledge entry updated successfully");
      return true;
    } catch (error) {
      console.error("Exception while updating knowledge entry:", error);
      return false;
    }
  };

  /**
   * Delete an entry from the knowledge base
   */
  const deleteEntry = async (id: string): Promise<boolean> => {
    try {
      console.log("Deleting knowledge entry:", id);
      
      const { error } = await supabase
        .from('knowledge_entries')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting knowledge entry:", error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'entrée",
          variant: "destructive"
        });
        return false;
      }
      
      console.log("Knowledge entry deleted successfully");
      return true;
    } catch (error) {
      console.error("Exception while deleting knowledge entry:", error);
      return false;
    }
  };

  return {
    addEntry,
    updateEntry,
    deleteEntry
  };
};
