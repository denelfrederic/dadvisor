
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeEntry, KnowledgeBaseOperations } from "../types";
import { generateEmbedding } from "@/components/chat/services/document/embeddingService";

/**
 * Service for managing the knowledge base using Supabase
 */
export const useKnowledgeBaseService = (): KnowledgeBaseOperations => {
  const { toast } = useToast();

  /**
   * Generate embedding for a knowledge base entry
   */
  const generateEntryEmbedding = async (text: string): Promise<number[] | null> => {
    try {
      const combinedText = text.trim();
      if (!combinedText) return null;

      return await generateEmbedding(combinedText);
    } catch (error) {
      console.error("Error generating embedding:", error);
      return null;
    }
  };

  /**
   * Add a new entry to the knowledge base
   */
  const addEntry = async (entry: Omit<KnowledgeEntry, 'id'>): Promise<KnowledgeEntry | null> => {
    try {
      console.log("Adding new knowledge entry:", entry);
      
      // Generate embedding for the entry if possible
      const combinedText = `${entry.question}\n${entry.answer}`;
      const embedding = await generateEntryEmbedding(combinedText);
      
      const insertData: any = {
        question: entry.question,
        answer: entry.answer,
        source: entry.source || "User input",
      };
      
      // Only add embedding if it was successfully generated
      if (embedding) {
        insertData.embedding = embedding;
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
          const combinedText = `${question}\n${answer}`;
          
          const embedding = await generateEntryEmbedding(combinedText);
          if (embedding) {
            updateData.embedding = embedding;
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

  /**
   * Get all entries from the knowledge base
   */
  const getEntries = async (): Promise<KnowledgeEntry[]> => {
    try {
      console.log("Fetching all knowledge entries");
      
      const { data, error } = await supabase
        .from('knowledge_entries')
        .select('id, question, answer, source, created_at, updated_at, embedding')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching knowledge entries:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer la base de connaissances",
          variant: "destructive"
        });
        return [];
      }
      
      console.log("Fetched knowledge entries:", data.length);
      return data as KnowledgeEntry[];
    } catch (error) {
      console.error("Exception while fetching knowledge entries:", error);
      return [];
    }
  };

  /**
   * Search entries in the knowledge base
   */
  const searchEntries = async (query: string): Promise<KnowledgeEntry[]> => {
    try {
      console.log("Searching knowledge entries for:", query);
      
      if (!query.trim()) {
        return [];
      }
      
      // Using Supabase's full-text search
      const { data, error } = await supabase
        .from('knowledge_entries')
        .select('id, question, answer, source, created_at, updated_at, embedding')
        .or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error searching knowledge entries:", error);
        toast({
          title: "Erreur",
          description: "Impossible d'effectuer la recherche",
          variant: "destructive"
        });
        return [];
      }
      
      console.log("Search results:", data.length);
      return data as KnowledgeEntry[];
    } catch (error) {
      console.error("Exception while searching knowledge entries:", error);
      return [];
    }
  };

  /**
   * Search entries by semantic similarity using embeddings
   */
  const searchEntriesBySimilarity = async (
    queryEmbedding: number[], 
    threshold: number = 0.7, 
    limit: number = 5
  ): Promise<KnowledgeEntry[]> => {
    try {
      console.log("Searching knowledge entries by similarity");
      
      const { data, error } = await supabase.rpc(
        'match_knowledge_entries',
        {
          query_embedding: queryEmbedding,
          similarity_threshold: threshold,
          match_count: limit
        }
      );
      
      if (error) {
        console.error("Error in similarity search:", error);
        toast({
          title: "Erreur",
          description: "Impossible d'effectuer la recherche sémantique",
          variant: "destructive"
        });
        return [];
      }
      
      console.log("Semantic search results:", data?.length || 0);
      return data as KnowledgeEntry[];
    } catch (error) {
      console.error("Exception in similarity search:", error);
      return [];
    }
  };

  return {
    addEntry,
    updateEntry,
    deleteEntry,
    getEntries,
    searchEntries,
    searchEntriesBySimilarity,
    generateEmbedding: generateEntryEmbedding
  };
};
