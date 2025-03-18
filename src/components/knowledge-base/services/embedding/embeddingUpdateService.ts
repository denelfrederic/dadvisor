
import { supabase } from "@/integrations/supabase/client";
import { KnowledgeEntry } from "../../types";
import { generateEntryEmbedding } from "../embedding/embeddingService";
import { prepareEmbeddingForStorage, processEntryForEmbedding } from "../embedding/embeddingUtils";
import { getAllEntries } from "../entry/entryService";

/**
 * Updates embeddings for a batch of knowledge entries
 */
export const updateEntryEmbeddingBatch = async (
  entries: KnowledgeEntry[],
  progressCallback?: (progress: number) => void
): Promise<void> => {
  const totalEntries = entries.length;
  let processedEntries = 0;
  let successCount = 0;
  
  try {
    for (const entry of entries) {
      try {
        // Generate new embedding from combined question and answer
        const combinedText = processEntryForEmbedding(entry.question, entry.answer);
        const embedding = await generateEntryEmbedding(combinedText);
        
        if (!embedding) {
          console.error(`Failed to generate embedding for entry ${entry.id}`);
          continue;
        }
        
        const embeddingString = prepareEmbeddingForStorage(embedding);
        
        // Update the entry in the database
        const { error } = await supabase
          .from('knowledge_entries')
          .update({ 
            embedding: embeddingString,
            updated_at: new Date().toISOString()
          })
          .eq('id', entry.id);
        
        if (error) {
          console.error(`Erreur lors de la mise à jour de l'entrée ${entry.id}:`, error);
          continue;
        }
        
        successCount++;
      } catch (entryError) {
        console.error(`Erreur lors de la mise à jour de l'entrée ${entry.id}:`, entryError);
      } finally {
        // Update progress regardless of success or failure
        processedEntries++;
        if (progressCallback) {
          progressCallback((processedEntries / totalEntries) * 100);
        }
      }
    }
    
    console.log(`${successCount}/${totalEntries} entrées mises à jour avec succès.`);
  } catch (error) {
    console.error('Error updating entry embeddings in batch:', error);
    throw error;
  }
};

/**
 * Updates embeddings for all documents
 * @returns Object with success status and count of updated documents
 */
export const updateDocuments = async (): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    // Query for documents without embeddings
    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, content')
      .or('embedding.is.null,embedding.eq.{}');  // Fix: Use {} instead of empty string

    if (error) {
      console.error("Error fetching documents:", error);
      return { success: false, count: 0, error: error.message };
    }

    if (!documents || documents.length === 0) {
      console.log("No documents found without embeddings");
      return { success: true, count: 0 };
    }

    console.log(`Found ${documents.length} documents without embeddings`);
    let updatedCount = 0;

    // Process each document
    for (const doc of documents) {
      try {
        // Generate embedding from document content
        const { data: embedding } = await supabase.functions.invoke("generate-embeddings", {
          body: { 
            text: doc.content,
            modelType: "document"
          }
        });

        if (!embedding || !embedding.embedding) {
          console.error(`Failed to generate embedding for document ${doc.id}`);
          continue;
        }

        // Update document with embedding
        const { error: updateError } = await supabase
          .from('documents')
          .update({ 
            embedding: JSON.stringify(embedding.embedding),
            updated_at: new Date().toISOString()
          })
          .eq('id', doc.id);

        if (updateError) {
          console.error(`Error updating document ${doc.id}:`, updateError);
          continue;
        }

        updatedCount++;
      } catch (docError) {
        console.error(`Error processing document ${doc.id}:`, docError);
      }
    }

    console.log(`Successfully updated ${updatedCount}/${documents.length} documents`);
    return { success: true, count: updatedCount };
  } catch (error) {
    console.error("Error in updateDocuments:", error);
    return { success: false, count: 0, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Updates embeddings for all knowledge entries
 * @param progressCallback Function to call with progress updates
 * @param logCallback Function to call with log messages
 * @returns Object with success status and counts of processed/succeeded entries
 */
export const updateKnowledgeEntries = async (
  progressCallback?: (progress: number) => void,
  logCallback?: (message: string) => void
): Promise<{ 
  success: boolean; 
  processed: number; 
  succeeded: number; 
  error?: string 
}> => {
  try {
    const log = (message: string) => {
      console.log(message);
      if (logCallback) logCallback(message);
    };

    log("Fetching knowledge entries without embeddings...");
    
    // Get entries that don't have embeddings - Fix the query to avoid empty string issue
    const { data: entries, error } = await supabase
      .from('knowledge_entries')
      .select('*')
      .or('embedding.is.null,embedding.eq.{}');  // Fix: Use {} instead of empty string

    if (error) {
      log(`Error fetching entries: ${error.message}`);
      return { success: false, processed: 0, succeeded: 0, error: error.message };
    }

    if (!entries || entries.length === 0) {
      log("No entries found without embeddings");
      return { success: true, processed: 0, succeeded: 0 };
    }

    log(`Found ${entries.length} entries without embeddings. Starting update...`);
    
    // Update the entries in batches
    await updateEntryEmbeddingBatch(entries, progressCallback);
    
    log(`Finished updating ${entries.length} entries`);
    
    return { 
      success: true, 
      processed: entries.length,
      succeeded: entries.length // This is an approximation, we should update to track actual success
    };
  } catch (error) {
    console.error("Error in updateKnowledgeEntries:", error);
    return { 
      success: false, 
      processed: 0, 
      succeeded: 0, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
};

/**
 * Updates embeddings for both documents and knowledge entries
 * @param progressCallback Function to call with progress updates
 * @param logCallback Function to call with log messages
 * @returns Object with success status and detailed results
 */
export const updateAllEmbeddings = async (
  progressCallback?: (progress: number) => void,
  logCallback?: (message: string) => void
): Promise<{
  success: boolean;
  documents: { processed: number; succeeded: number };
  knowledgeEntries: { processed: number; succeeded: number };
  error?: string;
}> => {
  try {
    const log = (message: string) => {
      console.log(message);
      if (logCallback) logCallback(message);
    };

    log("Starting complete embedding update process...");
    
    // Step 1: Update documents
    log("Step 1: Updating document embeddings...");
    const docResult = await updateDocuments();
    
    log(`Document update ${docResult.success ? 'completed' : 'failed'}: ${docResult.count} documents updated`);
    
    if (progressCallback) {
      progressCallback(50); // 50% done after documents
    }
    
    // Step 2: Update knowledge entries
    log("Step 2: Updating knowledge entry embeddings...");
    const entriesResult = await updateKnowledgeEntries(
      // We adjust the progress to go from 50% to 100%
      (progress) => progressCallback && progressCallback(50 + (progress / 2)),
      logCallback
    );
    
    log(`Knowledge entry update ${entriesResult.success ? 'completed' : 'failed'}: ${entriesResult.succeeded}/${entriesResult.processed} entries updated`);
    
    if (progressCallback) {
      progressCallback(100); // Complete
    }
    
    log("Complete embedding update process finished.");
    
    return {
      success: docResult.success && entriesResult.success,
      documents: {
        processed: docResult.count, // Approximate
        succeeded: docResult.count
      },
      knowledgeEntries: {
        processed: entriesResult.processed,
        succeeded: entriesResult.succeeded
      }
    };
  } catch (error) {
    console.error("Error in updateAllEmbeddings:", error);
    return {
      success: false,
      documents: { processed: 0, succeeded: 0 },
      knowledgeEntries: { processed: 0, succeeded: 0 },
      error: error instanceof Error ? error.message : String(error)
    };
  }
};
