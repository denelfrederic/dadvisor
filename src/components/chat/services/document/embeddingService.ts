
import { supabase } from "@/integrations/supabase/client";
import { parseEmbedding, prepareEmbeddingForStorage, isValidEmbedding } from "@/components/knowledge-base/services/embedding/embeddingUtils";

// Fonction pour adapter les dimensions d'un embedding
const adaptEmbeddingDimensions = (embedding: number[], targetDimension = 768): number[] => {
  if (!embedding || !Array.isArray(embedding)) {
    throw new Error("L'embedding doit être un tableau de nombres");
  }
  
  const currentDimension = embedding.length;
  console.log(`Adaptation des dimensions de l'embedding: ${currentDimension} -> ${targetDimension}`);
  
  if (currentDimension === targetDimension) {
    return embedding; // Déjà la bonne dimension
  }
  
  if (currentDimension > targetDimension) {
    // Réduction des dimensions: prendre les premières 'targetDimension' valeurs
    console.log(`Réduction des dimensions de ${currentDimension} à ${targetDimension}`);
    return embedding.slice(0, targetDimension);
  } else {
    // Augmentation des dimensions: remplir avec des zéros
    console.log(`Augmentation des dimensions de ${currentDimension} à ${targetDimension} (non recommandé)`);
    const result = [...embedding];
    while (result.length < targetDimension) {
      result.push(0);
    }
    return result;
  }
};

// Fonction pour générer l'embedding à partir du texte
export const generateEmbedding = async (text: string, modelType = "document", options = {}): Promise<any> => {
  try {
    // Vérifier si le texte est valide
    if (!text || text.trim().length === 0) {
      console.error("Le texte ne peut pas être vide pour la génération d'embedding");
      throw new Error("Le texte est vide ou invalide");
    }

    // Configuration par défaut
    const defaultOptions = {
      maxLength: 8000, // Réduit la taille maximale par défaut
      retries: 2,
      chunkSize: 0, // 0 signifie pas de découpage
      targetDimension: 768, // Dimension cible pour la base de données
      ...options
    };

    // Tronquer le texte si nécessaire
    const truncatedText = text.slice(0, defaultOptions.maxLength);
    
    console.log(`Générant embedding pour ${modelType}, longueur texte: ${truncatedText.length} caractères (texte original: ${text.length} caractères)`);
    
    let lastError = null;
    let retryCount = 0;
    
    // Tentatives multiples avec différentes configurations
    while (retryCount <= defaultOptions.retries) {
      try {
        // Pour les gros textes, on réduit la taille à chaque tentative
        const adjustedMaxLength = defaultOptions.maxLength - (retryCount * 1000);
        const currentText = text.slice(0, Math.max(3000, adjustedMaxLength));
        
        console.log(`Tentative ${retryCount + 1}/${defaultOptions.retries + 1} avec ${currentText.length} caractères`);
        
        // Appel à notre fonction edge pour générer l'embedding
        const { data, error } = await supabase.functions.invoke("generate-embeddings", {
          body: { 
            text: currentText,
            modelType,
            options: {
              attemptNumber: retryCount + 1,
              totalAttempts: defaultOptions.retries + 1,
              useBackupModel: retryCount > 0 // Utiliser le modèle de secours dès la deuxième tentative
            }
          }
        });
        
        if (error) {
          console.error(`Erreur Supabase lors de la tentative ${retryCount + 1}:`, error);
          lastError = error;
          retryCount++;
          continue;
        }
        
        if (!data || !data.embedding || !Array.isArray(data.embedding) || data.embedding.length === 0) {
          console.error(`Embedding invalide lors de la tentative ${retryCount + 1}:`, data);
          lastError = new Error("L'embedding généré est invalide ou vide");
          retryCount++;
          continue;
        }
        
        console.log(`Embedding généré avec succès: ${data.embedding.length} dimensions, modèle: ${data.modelName || 'inconnu'}`);
        
        // Vérifier que l'embedding est valide
        if (!isValidEmbedding(data.embedding)) {
          console.error(`Embedding invalide lors de la tentative ${retryCount + 1}:`, data.embedding.slice(0, 5), "...");
          lastError = new Error("L'embedding généré n'est pas valide");
          retryCount++;
          continue;
        }
        
        // Adapter les dimensions de l'embedding si nécessaire
        const adaptedEmbedding = adaptEmbeddingDimensions(data.embedding, defaultOptions.targetDimension);
        
        return adaptedEmbedding;
      } catch (attemptError) {
        console.error(`Exception lors de la tentative ${retryCount + 1}:`, attemptError);
        lastError = attemptError;
        retryCount++;
      }
    }
    
    // Si nous arrivons ici, toutes les tentatives ont échoué
    throw lastError || new Error("Échec de la génération d'embedding après plusieurs tentatives");
  } catch (error) {
    console.error("Exception lors de la génération de l'embedding:", error);
    throw error;
  }
};

// Fonction pour forcer la génération d'un embedding avec des paramètres optimisés pour les cas difficiles
export const forceGenerateEmbedding = async (documentId: string): Promise<boolean> => {
  try {
    console.log(`Tentative de génération forcée d'embedding pour le document ${documentId}`);
    
    // Récupérer le document
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('id, content, title, type')
      .eq('id', documentId)
      .single();
    
    if (fetchError || !document) {
      console.error("Erreur lors de la récupération du document:", fetchError);
      return false;
    }
    
    if (!document.content || document.content.trim() === '') {
      console.error("Le document n'a pas de contenu");
      return false;
    }
    
    console.log(`Document récupéré: ${document.title}, type: ${document.type}, taille contenu: ${document.content.length}`);
    
    // Options optimisées pour les cas difficiles
    const options = {
      maxLength: 6000, // Réduire davantage la taille pour les documents problématiques
      retries: 3,      // Faire plus de tentatives
      targetDimension: 768, // Dimension cible pour la base de données
    };
    
    // Pour les PDF, réduire encore plus la taille
    if (document.type === 'application/pdf') {
      options.maxLength = 4000;
      console.log("Document PDF détecté, taille maximale réduite à 4000 caractères");
    }
    
    // Générer l'embedding avec les options optimisées
    const embedding = await generateEmbedding(document.content, "document", options);
    
    if (!embedding) {
      console.error("Échec de la génération d'embedding optimisée");
      return false;
    }
    
    // Préparer pour le stockage
    const embeddingForStorage = prepareEmbeddingForStorage(embedding);
    
    // Mettre à jour le document
    const { error: updateError } = await supabase
      .from('documents')
      .update({ embedding: embeddingForStorage })
      .eq('id', document.id);
    
    if (updateError) {
      console.error("Erreur lors de la mise à jour de l'embedding:", updateError);
      return false;
    }
    
    console.log(`Embedding généré et enregistré avec succès pour ${document.title}`);
    return true;
  } catch (error) {
    console.error("Erreur lors de la génération forcée d'embedding:", error);
    return false;
  }
};
