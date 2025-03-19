
/**
 * This file contains functions for manual testing of the document indexation process
 * Run these functions from the browser console to test report generation and indexation
 */

// Function to test report generation
export async function testReportGeneration() {
  console.log("Starting manual test for report generation...");
  
  // Import the supabase client
  const { supabase } = await import("@/integrations/supabase/client");
  
  // Get all documents
  console.log("Fetching all documents...");
  const { data: documents, error } = await supabase
    .from('documents')
    .select('id, title, type, embedding')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching documents:", error);
    return;
  }
  
  console.log(`Found ${documents.length} documents`);
  
  // Check embeddings
  let withEmbedding = 0;
  let withoutEmbedding = 0;
  
  documents.forEach(doc => {
    if (doc.embedding) {
      withEmbedding++;
      console.log(`✅ Document ${doc.id} (${doc.title}) has embedding`);
    } else {
      withoutEmbedding++;
      console.log(`❌ Document ${doc.id} (${doc.title}) has NO embedding`);
    }
  });
  
  console.log("===== EMBEDDING SUMMARY =====");
  console.log(`Total documents: ${documents.length}`);
  console.log(`With embedding: ${withEmbedding} (${Math.round((withEmbedding / documents.length) * 100)}%)`);
  console.log(`Without embedding: ${withoutEmbedding} (${Math.round((withoutEmbedding / documents.length) * 100)}%)`);
  
  return {
    total: documents.length,
    withEmbedding,
    withoutEmbedding,
    percentage: Math.round((withEmbedding / documents.length) * 100)
  };
}

// Function to test document embedding update
export async function testEmbeddingUpdate() {
  console.log("Starting manual test for embedding update...");
  
  // Import required modules
  const { updateDocumentEmbeddings } = await import("../chat/services/document/documentProcessor");
  
  // Attempt to update embeddings
  console.log("Updating document embeddings...");
  const result = await updateDocumentEmbeddings();
  
  console.log("Update complete:", result);
  console.log(`Updated ${result.count} documents`);
  
  // Verify result with a new report
  await testReportGeneration();
  
  return result;
}

// Function to compare report data with actual data
export async function verifyReportAccuracy() {
  console.log("Verifying report accuracy...");
  
  // Get actual data from database
  const actualStats = await testReportGeneration();
  
  // Access the Report component state via window
  // Note: This requires adding the report to window in the DocumentReport component
  // which would be done temporarily for testing
  const reportFromUI = (window as any).__documentReport;
  
  if (!reportFromUI) {
    console.error("Cannot access report from UI. Make sure window.__documentReport is set.");
    return;
  }
  
  console.log("Report from UI:", reportFromUI);
  console.log("Actual data from database:", actualStats);
  
  // Compare stats
  const isAccurate = 
    actualStats.total === reportFromUI.totalDocuments &&
    actualStats.withEmbedding === reportFromUI.documentsWithEmbeddings &&
    actualStats.withoutEmbedding === reportFromUI.documentsWithoutEmbeddings &&
    actualStats.percentage === reportFromUI.embeddingsPercentage;
  
  console.log("Report accuracy test:", isAccurate ? "PASSED ✅" : "FAILED ❌");
  
  if (!isAccurate) {
    console.log("Discrepancies found:");
    if (actualStats.total !== reportFromUI.totalDocuments) {
      console.log(`- Total documents: Actual=${actualStats.total}, Report=${reportFromUI.totalDocuments}`);
    }
    if (actualStats.withEmbedding !== reportFromUI.documentsWithEmbeddings) {
      console.log(`- With embedding: Actual=${actualStats.withEmbedding}, Report=${reportFromUI.documentsWithEmbeddings}`);
    }
    if (actualStats.withoutEmbedding !== reportFromUI.documentsWithoutEmbeddings) {
      console.log(`- Without embedding: Actual=${actualStats.withoutEmbedding}, Report=${reportFromUI.documentsWithoutEmbeddings}`);
    }
    if (actualStats.percentage !== reportFromUI.embeddingsPercentage) {
      console.log(`- Percentage: Actual=${actualStats.percentage}, Report=${reportFromUI.embeddingsPercentage}`);
    }
  }
  
  return {
    isAccurate,
    actualStats,
    reportFromUI
  };
}

// Add these functions to window for easy access from the console
// This is only for testing purposes
(window as any).testDocumentReporting = {
  testReportGeneration,
  testEmbeddingUpdate,
  verifyReportAccuracy
};

console.log("Document reporting test functions loaded. Access via window.testDocumentReporting in the console.");
