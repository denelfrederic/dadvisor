
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
  
  try {
    // Instead of importing the module which doesn't exist at the expected path,
    // we'll implement a simpler version directly using the Supabase client
    const { supabase } = await import("@/integrations/supabase/client");
    
    // Find documents without embeddings
    console.log("Finding documents without embeddings...");
    const { data: documentsWithoutEmbeddings, error: queryError } = await supabase
      .from('documents')
      .select('id, title, content')
      .is('embedding', null);
      
    if (queryError) {
      console.error("Error querying documents:", queryError);
      return { success: false, error: queryError.message, count: 0 };
    }
    
    console.log(`Found ${documentsWithoutEmbeddings?.length || 0} documents without embeddings`);
    
    if (!documentsWithoutEmbeddings || documentsWithoutEmbeddings.length === 0) {
      console.log("No documents need embeddings. All documents are already processed.");
      return { success: true, count: 0, message: "No documents needed embeddings" };
    }
    
    // For the test scenario, we'll just simulate updating embeddings
    // In a real implementation, you would call the API to generate embeddings
    console.log("Simulating embedding updates (no actual updates in test mode)");
    
    // In a real implementation, this would update the documents with embeddings
    // But for this test function, we're just simulating the process
    const updatedCount = documentsWithoutEmbeddings.length;
    
    console.log(`Would update ${updatedCount} documents if this wasn't a test`);
    
    return {
      success: true,
      count: updatedCount,
      message: "Test simulation complete - no actual updates performed"
    };
    
  } catch (error) {
    console.error("Error in testEmbeddingUpdate:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error", 
      count: 0 
    };
  } finally {
    // Verify result with a new report
    await testReportGeneration();
  }
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
