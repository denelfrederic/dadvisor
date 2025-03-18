import { supabase } from "@/integrations/supabase/client";
import { DocumentSearchResult } from '../types';

// Process and store document in Supabase
export const processDocument = async (file: File): Promise<boolean> => {
  try {
    // For PDFs and images, we'll store a placeholder with metadata
    const content = `[Ce document est au format ${file.type}. Taille: ${(file.size / 1024).toFixed(2)} KB]`;
    
    // Insert document into Supabase
    const { error } = await supabase
      .from('documents')
      .insert({
        title: file.name,
        content: content,
        type: file.type,
        size: file.size,
        source: "Upload utilisateur"
      });
    
    if (error) {
      console.error("Erreur lors de l'insertion du document:", error);
      return false;
    }
    
    console.log(`Document ajouté à la base: ${file.name}`);
    return true;
  } catch (error) {
    console.error("Erreur lors du traitement du document:", error);
    return false;
  }
};

// Helper to read file content
export const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error("Échec de lecture du fichier"));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Erreur lors de la lecture du fichier"));
    };
    
    // Determine how to read the file based on its type
    if (file.type.includes('text') || 
        file.name.endsWith('.md') || 
        file.name.endsWith('.json') || 
        file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      // For binary files, read as text but we'll only use metadata
      reader.readAsText(file);
    }
  });
};

// Function to get document stats from Supabase
export const getDocumentStats = async () => {
  const { data: docs, error } = await supabase
    .from('documents')
    .select('type, size');
    
  if (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return {
      count: 0,
      types: {},
      totalSize: 0
    };
  }
  
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
  
  return {
    count: docs.length,
    types,
    totalSize
  };
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

// Search documents using Supabase's search_documents function
export const searchLocalDocuments = async (query: string): Promise<DocumentSearchResult[]> => {
  try {
    const { data, error } = await supabase
      .rpc('search_documents', {
        search_query: query
      });
      
    if (error) {
      console.error("Erreur lors de la recherche:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erreur lors de la recherche dans les documents:", error);
    return [];
  }
};
