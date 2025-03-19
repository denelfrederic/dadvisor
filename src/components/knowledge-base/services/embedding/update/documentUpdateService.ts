
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates embeddings for all documents
 * @returns Object with success status and count of updated documents
 */
export const updateDocuments = async (
  onProgress?: (message: string) => void
): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    onProgress?.("Starting document embeddings update...");
    
    // Query for documents without embeddings - only use IS NULL condition to avoid syntax errors
    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, content')
      .is('embedding', null);  // Use only IS NULL to avoid type issues

    if (error) {
      console.error("Error fetching documents:", error);
      onProgress?.(`Error fetching documents: ${error.message}`);
      return { success: false, count: 0, error: error.message };
    }

    if (!documents || documents.length === 0) {
      console.log("No documents found without embeddings");
      onProgress?.("No documents found without embeddings");
      return { success: true, count: 0 };
    }

    console.log(`Found ${documents.length} documents without embeddings`);
    onProgress?.(`Found ${documents.length} documents without embeddings`);
    let updatedCount = 0;
    let failedCount = 0;

    // Process each document
    for (const doc of documents) {
      try {
        onProgress?.(`Processing document ${doc.id.substring(0, 8)}...`);
        
        // Generate embedding from document content
        const { data: embedding, error: embeddingError } = await supabase.functions.invoke("generate-embeddings", {
          body: { 
            text: doc.content,
            modelType: "document"
          }
        });

        if (embeddingError || !embedding || !embedding.embedding) {
          console.error(`Failed to generate embedding for document ${doc.id}:`, embeddingError);
          onProgress?.(`Failed to generate embedding for document ${doc.id}: ${embeddingError?.message || "Unknown error"}`);
          failedCount++;
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
          onProgress?.(`Error updating document ${doc.id}: ${updateError.message}`);
          failedCount++;
          continue;
        }

        updatedCount++;
        onProgress?.(`Successfully updated document ${doc.id.substring(0, 8)}`);
      } catch (docError) {
        failedCount++;
        const errorMsg = docError instanceof Error ? docError.message : String(docError);
        console.error(`Error processing document ${doc.id}:`, docError);
        onProgress?.(`Error processing document ${doc.id}: ${errorMsg}`);
      }
    }

    const summary = `Successfully updated ${updatedCount}/${documents.length} documents, ${failedCount} failed`;
    console.log(summary);
    onProgress?.(summary);
    
    return { 
      success: true, 
      count: updatedCount, 
      error: failedCount > 0 ? `${failedCount} documents failed to update` : undefined 
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Error in updateDocuments:", error);
    onProgress?.(`Error in updateDocuments: ${errorMsg}`);
    return { success: false, count: 0, error: errorMsg };
  }
};

/**
 * Alias for updateDocuments for backwards compatibility
 */
export const updateDocumentEmbeddings = updateDocuments;
