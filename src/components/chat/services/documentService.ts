
import { DocumentSearchResult } from '../types';

// Fonction pour gérer l'upload et le traitement de documents
export const processDocument = async (file: File): Promise<boolean> => {
  try {
    // Read the file content
    const content = await readFileContent(file);
    if (!content) {
      throw new Error("Impossible de lire le contenu du fichier");
    }
    
    // Create document object
    const document = {
      id: `doc_${Date.now()}`,
      title: file.name,
      content: content,
      type: file.type,
      size: file.size,
      source: "Upload utilisateur",
      timestamp: new Date().toISOString()
    };
    
    // Save to local document store
    const existingDocsString = localStorage.getItem('documentDatabase');
    const existingDocs = existingDocsString ? JSON.parse(existingDocsString) : [];
    
    // Add the new document
    existingDocs.push(document);
    
    // Save back to localStorage
    localStorage.setItem('documentDatabase', JSON.stringify(existingDocs));
    
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
    
    // Read based on file type
    if (file.type.includes('text') || 
        file.name.endsWith('.md') || 
        file.name.endsWith('.json') || 
        file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      // For binary files we would normally process differently
      // For now, just read as text to extract whatever we can
      reader.readAsText(file);
    }
  });
};

// Function to get document stats
export const getDocumentStats = () => {
  const docsString = localStorage.getItem('documentDatabase');
  if (!docsString) {
    return {
      count: 0,
      types: {},
      totalSize: 0
    };
  }
  
  const docs = JSON.parse(docsString);
  const types = {};
  let totalSize = 0;
  
  docs.forEach(doc => {
    // Count by file type
    if (doc.type) {
      types[doc.type] = (types[doc.type] || 0) + 1;
    }
    
    // Sum up sizes
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

// Function to clear the document database
export const clearDocumentDatabase = () => {
  localStorage.removeItem('documentDatabase');
};

// Recherche les documents pertinents dans la base locale
export const searchLocalDocuments = async (query: string): Promise<DocumentSearchResult[]> => {
  try {
    // First check if we have local documents stored
    const localDocuments = localStorage.getItem('documentDatabase');
    if (!localDocuments) {
      console.log("Aucun document dans la base locale");
      return [];
    }

    // Parse the documents from localStorage
    const documents = JSON.parse(localDocuments);
    
    // Simple keyword-based search (in a real app, this would use vector similarity)
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    
    if (searchTerms.length === 0) return [];
    
    const results = documents.map(doc => {
      const content = doc.content.toLowerCase();
      let score = 0;
      let matchCount = 0;
      
      searchTerms.forEach(term => {
        const matches = content.match(new RegExp(term, 'g'));
        if (matches) {
          matchCount += matches.length;
          score += matches.length;
        }
      });
      
      // Give higher score to documents with matching titles
      if (doc.title) {
        const titleLower = doc.title.toLowerCase();
        searchTerms.forEach(term => {
          if (titleLower.includes(term)) {
            score += 5; // Title matches are more important
          }
        });
      }
      
      return {
        ...doc,
        score,
        matchCount
      };
    }).filter(doc => doc.score > 0);
    
    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);
    
    // Return top results
    return results.slice(0, 5);
  } catch (error) {
    console.error("Erreur lors de la recherche dans les documents:", error);
    return [];
  }
};
