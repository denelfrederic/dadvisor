
import { supabase } from "@/integrations/supabase/client";
import { DocumentSearchResult } from '../types';

// Process and store document in Supabase
export const processDocument = async (file: File): Promise<boolean> => {
  try {
    console.log(`Début du traitement du document: ${file.name}`);
    
    // Pour les fichiers texte, nous essayons de lire le contenu
    let content = "";
    
    if (file.type.includes('text') || 
        file.name.endsWith('.md') || 
        file.name.endsWith('.json') || 
        file.name.endsWith('.csv')) {
      try {
        content = await readFileContent(file);
        console.log(`Contenu lu avec succès: ${content.substring(0, 100)}...`);
      } catch (readError) {
        console.error("Erreur lors de la lecture du contenu:", readError);
        content = `[Erreur de lecture du contenu. Format: ${file.type}]`;
      }
    } else if (file.type === 'application/pdf') {
      // Pour les PDFs, nous essayons d'extraire le texte basique
      try {
        content = await extractPdfText(file);
        console.log(`Contenu PDF extrait: ${content.substring(0, 100)}...`);
      } catch (pdfError) {
        console.error("Erreur lors de l'extraction du PDF:", pdfError);
        content = `[Document PDF: ${file.name}. Échec de l'extraction du texte.]`;
      }
    } else {
      // Pour les autres fichiers, nous stockons un placeholder avec les métadonnées
      content = `[Ce document est au format ${file.type}. Taille: ${(file.size / 1024).toFixed(2)} KB]`;
    }
    
    // Générer l'embedding pour le contenu
    let embedding = null;
    if (content && content.length > 0) {
      try {
        embedding = await generateEmbedding(content);
        console.log("Embedding généré avec succès");
      } catch (embeddingError) {
        console.error("Erreur lors de la génération de l'embedding:", embeddingError);
        // Continuer sans embedding si l'erreur se produit
      }
    }
    
    // Insérer le document dans Supabase avec journalisation détaillée
    console.log("Tentative d'insertion dans Supabase:", {
      title: file.name,
      type: file.type,
      size: file.size,
      has_embedding: embedding !== null
    });

    const { data, error } = await supabase
      .from('documents')
      .insert({
        title: file.name,
        content: content,
        type: file.type,
        size: file.size,
        source: "Upload utilisateur",
        embedding: embedding
      })
      .select()
      .single();
    
    if (error) {
      console.error("Erreur lors de l'insertion du document:", error);
      throw new Error(`Erreur Supabase: ${error.message}`);
    }
    
    console.log("Document ajouté avec succès:", data);
    return true;

  } catch (error) {
    console.error("Erreur lors du traitement du document:", error);
    return false;
  }
};

// Fonction pour générer l'embedding à partir du texte
export const generateEmbedding = async (text: string): Promise<any> => {
  try {
    // Tronquer le texte si nécessaire (les API d'embedding ont souvent des limites de caractères)
    const truncatedText = text.slice(0, 10000);
    
    // Appel à notre fonction edge pour générer l'embedding
    const { data, error } = await supabase.functions.invoke("generate-embeddings", {
      body: { text: truncatedText }
    });
    
    if (error) {
      console.error("Erreur lors de la génération de l'embedding:", error);
      throw new Error("Échec de la génération de l'embedding");
    }
    
    return data.embedding;
  } catch (error) {
    console.error("Exception lors de la génération de l'embedding:", error);
    throw error;
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

// Function to extract text from PDF using FileReader (basic browser approach)
export const extractPdfText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      if (!event.target?.result) {
        reject(new Error("Échec de lecture du PDF"));
        return;
      }
      
      try {
        // For PDF files we're limited in browser environment
        // This is a placeholder that will extract whatever text is easily accessible
        const arrayBuffer = event.target.result as ArrayBuffer;
        
        // Basic text extraction from binary data
        // This will only extract plain text that's directly embedded
        const textDecoder = new TextDecoder('utf-8');
        let text = textDecoder.decode(arrayBuffer);
        
        // Clean up the text - remove binary garbage
        text = text.replace(/[^\x20-\x7E\r\n]/g, ' ')
                   .replace(/\s+/g, ' ')
                   .trim();
        
        // If we couldn't extract meaningful text, provide a placeholder
        if (text.length < 50 || text.includes('%PDF')) {
          text = `[Document PDF: ${file.name}. Contenu binaire non extractible côté client.]`;
          console.log("Extraction de texte PDF limitée, contenu binaire détecté");
        }
        
        resolve(text);
      } catch (error) {
        console.error("Erreur lors de l'extraction du texte PDF:", error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Erreur lors de la lecture du PDF"));
    };
    
    // Read the PDF as ArrayBuffer to process its binary content
    reader.readAsArrayBuffer(file);
  });
};

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

// Recherche de documents avec similarité vectorielle
export const searchLocalDocuments = async (query: string): Promise<DocumentSearchResult[]> => {
  try {
    // Essayer d'abord la recherche vectorielle si possible
    try {
      // Générer l'embedding pour la requête
      const queryEmbedding = await generateEmbedding(query);
      
      // Recherche vectorielle avec match_documents
      const { data: vectorResults, error: vectorError } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        similarity_threshold: 0.6, // Ajustable selon les besoins
        match_count: 5
      });
      
      if (!vectorError && vectorResults && vectorResults.length > 0) {
        console.log("Résultats de recherche vectorielle trouvés:", vectorResults.length);
        return vectorResults.map(item => ({
          id: item.id,
          title: item.title || "Sans titre",
          content: item.content,
          type: item.type,
          source: item.source,
          score: item.similarity,
          matchCount: 1 // Non applicable pour la recherche vectorielle
        }));
      }
    } catch (vectorSearchError) {
      console.warn("Recherche vectorielle échouée, repli sur la recherche textuelle:", vectorSearchError);
      // Continuer avec la recherche textuelle en cas d'échec
    }
    
    // Recherche textuelle classique (fallback)
    const { data: textResults, error: textError } = await supabase.rpc('search_documents', {
      search_query: query
    });
      
    if (textError) {
      console.error("Erreur lors de la recherche textuelle:", textError);
      return [];
    }
    
    return textResults || [];
  } catch (error) {
    console.error("Erreur lors de la recherche dans les documents:", error);
    return [];
  }
};

// Fonction pour mettre à jour les embeddings de documents existants sans embedding
export const updateDocumentEmbeddings = async (): Promise<{ success: boolean, count: number }> => {
  try {
    // Récupérer les documents sans embedding
    const { data: documentsWithoutEmbedding, error: fetchError } = await supabase
      .from('documents')
      .select('id, content')
      .is('embedding', null)
      .not('content', 'eq', '');
    
    if (fetchError) {
      console.error("Erreur lors de la récupération des documents sans embedding:", fetchError);
      return { success: false, count: 0 };
    }
    
    if (!documentsWithoutEmbedding || documentsWithoutEmbedding.length === 0) {
      console.log("Aucun document sans embedding trouvé.");
      return { success: true, count: 0 };
    }
    
    console.log(`${documentsWithoutEmbedding.length} documents sans embedding trouvés, traitement...`);
    
    // Mettre à jour chaque document
    let successCount = 0;
    
    for (const doc of documentsWithoutEmbedding) {
      if (!doc.content) continue;
      
      try {
        // Générer l'embedding
        const embedding = await generateEmbedding(doc.content);
        
        // Mettre à jour le document
        const { error: updateError } = await supabase
          .from('documents')
          .update({ embedding })
          .eq('id', doc.id);
        
        if (updateError) {
          console.error(`Erreur lors de la mise à jour de l'embedding pour le document ${doc.id}:`, updateError);
        } else {
          successCount++;
          console.log(`Document ${doc.id} mis à jour avec embedding.`);
        }
      } catch (docError) {
        console.error(`Erreur lors du traitement du document ${doc.id}:`, docError);
      }
    }
    
    console.log(`${successCount}/${documentsWithoutEmbedding.length} documents mis à jour avec succès.`);
    return { success: true, count: successCount };
  } catch (error) {
    console.error("Erreur lors de la mise à jour des embeddings:", error);
    return { success: false, count: 0 };
  }
};
