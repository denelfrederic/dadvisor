
import { readFileContent, extractPdfText } from "./documentUtils";
import { generateEmbedding } from "./embeddingService";
import { supabase } from "@/integrations/supabase/client";

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
        embedding = await generateEmbedding(content, "document");
        console.log("Embedding généré avec succès");
      } catch (embeddingError) {
        console.error("Erreur lors de la génération de l'embedding:", embeddingError);
        // Continuer sans embedding si l'erreur se produit
      }
    }
    
    // Préparer l'embedding pour le stockage (JSON.stringify si ce n'est pas déjà une chaîne)
    const embeddingForStorage = embedding ? 
      (typeof embedding === 'string' ? embedding : JSON.stringify(embedding)) : 
      null;
    
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
        embedding: embeddingForStorage
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
        const embedding = await generateEmbedding(doc.content, "document");
        
        // Préparer l'embedding pour le stockage
        const embeddingForStorage = embedding ? 
          (typeof embedding === 'string' ? embedding : JSON.stringify(embedding)) : 
          null;
        
        // Mettre à jour le document
        const { error: updateError } = await supabase
          .from('documents')
          .update({ embedding: embeddingForStorage })
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
