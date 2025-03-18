
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeEntry } from "../../types";
import { generateEntryEmbedding } from "../embedding/embeddingService";
import { processEntryForEmbedding } from "../embedding/embeddingUtils";

export const createEntry = async (
  question: string,
  answer: string,
  source?: string
): Promise<KnowledgeEntry> => {
  try {
    const { data, error } = await supabase
      .from('knowledge_entries')
      .insert([{ question, answer, source }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as KnowledgeEntry;
  } catch (error) {
    console.error("Error creating entry:", error);
    throw error;
  }
};

export const getEntryById = async (id: string): Promise<KnowledgeEntry | null> => {
  try {
    const { data, error } = await supabase
      .from('knowledge_entries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching entry by ID:", error);
      return null;
    }

    return data as KnowledgeEntry;
  } catch (error) {
    console.error("Error fetching entry by ID:", error);
    return null;
  }
};

export const getAllEntries = async (): Promise<KnowledgeEntry[]> => {
  try {
    const { data: entries, error } = await supabase
      .from('knowledge_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching all entries:", error);
      return [];
    }

    return entries as KnowledgeEntry[];
  } catch (error) {
    console.error("Error fetching all entries:", error);
    return [];
  }
};

export const updateEntry = async (
  id: string,
  updates: Partial<KnowledgeEntry>
): Promise<KnowledgeEntry | null> => {
  try {
    const { data, error } = await supabase
      .from('knowledge_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating entry:", error);
      return null;
    }

    return data as KnowledgeEntry;
  } catch (error) {
    console.error("Error updating entry:", error);
    return null;
  }
};

export const deleteEntry = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('knowledge_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting entry:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting entry:", error);
    return false;
  }
};

export const updateEntryEmbedding = async (entry: KnowledgeEntry): Promise<KnowledgeEntry> => {
  try {
    // Generate embedding from combined question and answer
    const combinedText = processEntryForEmbedding(entry.question, entry.answer);
    const embedding = await generateEntryEmbedding(combinedText);
    
    // Store embedding as a string in Supabase
    const embeddingString = JSON.stringify(embedding);
    
    // Update the entry with the new embedding
    const { data, error } = await supabase
      .from('knowledge_entries')
      .update({
        embedding: embeddingString,
        updated_at: new Date().toISOString()
      })
      .eq('id', entry.id)
      .select()
      .single();
    
    if (error) throw error;
    return data as KnowledgeEntry;
  } catch (error) {
    console.error('Error updating entry embedding:', error);
    throw error;
  }
};

export const deleteEntryEmbedding = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('knowledge_entries')
      .update({ embedding: null })
      .eq('id', id);

    if (error) {
      console.error("Error deleting entry embedding:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting entry embedding:", error);
    return false;
  }
};

// Add hook for compatibility with the knowledge base service
export const useEntryService = () => {
  return {
    addEntry: async (entry: Omit<KnowledgeEntry, 'id'>) => {
      return await createEntry(entry.question, entry.answer, entry.source);
    },
    updateEntry: async (id: string, updates: Partial<KnowledgeEntry>) => {
      return !!(await updateEntry(id, updates));
    },
    deleteEntry: deleteEntry
  };
};
