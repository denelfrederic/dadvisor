
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates embeddings for all documents
 * @returns Object with success status and count of updated documents
 */
export const updateDocuments = async (): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    // Query for documents without embeddings - only use IS NULL condition to avoid syntax errors
    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, content')
      .is('embedding', null);  // Use only IS NULL to avoid type issues

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
