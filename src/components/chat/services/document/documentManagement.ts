
import { supabase } from "@/integrations/supabase/client";

// Function to get document stats from Supabase
export const getDocumentStats = async () => {
  console.log("Récupération des statistiques des documents...");
  
  const { data: docs, error } = await supabase
    .from('documents')
    .select('type, size')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return {
      count: 0,
      types: {},
      totalSize: 0
    };
  }
  
  console.log("Documents récupérés:", docs);
  
  const types = {};
  let totalSize = 0;
  
  docs.forEach(doc => {
    if (doc.type) {
      types[doc.type] = (types[doc.type] || 0) + 1;
    }
    if (doc.size) {
      totalSize += doc.size;
    }
  });
  
  const stats = {
    count: docs.length,
    types,
    totalSize
  };
  
  console.log("Statistiques calculées:", stats);
  return stats;
};

// Function to clear all documents
export const clearDocumentDatabase = async () => {
  const { error } = await supabase
    .from('documents')
    .delete()
    .neq('id', 'placeholder'); // Delete all rows
    
  if (error) {
    console.error("Erreur lors de la suppression des documents:", error);
    return false;
  }
  return true;
};

// Export all documents from the database
export const exportDocuments = async () => {
  console.log("Export des documents...");
  
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Erreur lors de l'export des documents:", error);
    throw new Error(`Erreur lors de l'export: ${error.message}`);
  }
  
  console.log(`${data?.length || 0} documents exportés`);
  return data;
};
