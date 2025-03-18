
import { updateKnowledgeEntries } from "./entryUpdateService";
import { updateDocuments } from "./documentUpdateService";

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
