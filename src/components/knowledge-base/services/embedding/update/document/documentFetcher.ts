
import { supabase } from "@/integrations/supabase/client";
import { DocumentForIndexing, LogCallback } from "./types";

/**
 * Récupère les documents à indexer depuis Supabase
 * @param onLog Fonction de callback pour les logs
 * @param forceReindex Si true, récupère tous les documents, sinon uniquement ceux non indexés
 * @returns Tableau de documents à indexer
 */
export const fetchDocumentsForIndexing = async (
  onLog?: LogCallback,
  forceReindex = false
): Promise<DocumentForIndexing[]> => {
  try {
    onLog?.("Recherche des documents à indexer...");
    
    // Récupérer d'abord le nombre total de documents
    const { count: totalCount, error: countError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      const errorMsg = `Erreur lors du comptage des documents: ${countError.message}`;
      onLog?.(errorMsg);
      throw new Error(errorMsg);
    }
    
    onLog?.(`Nombre total de documents: ${totalCount || 0}`);
    
    // Construire la requête en fonction du mode (forceReindex ou non)
    let query = supabase
      .from('documents')
      .select('id, content, title, type, pinecone_indexed, created_at')
      .not('content', 'is', null)
      .not('content', 'eq', '');
    
    // Si forceReindex est false, on ne récupère que les documents non indexés
    if (!forceReindex) {
      query = query.or('pinecone_indexed.is.null,pinecone_indexed.eq.false');
      onLog?.("Mode standard: indexation des documents non encore indexés");
    } else {
      onLog?.("Mode FORCE: réindexation de TOUS les documents, même ceux déjà indexés");
    }
    
    const { data: documents, error: fetchError } = await query;
    
    if (fetchError) {
      const errorMsg = `Erreur lors de la récupération des documents: ${fetchError.message}`;
      onLog?.(errorMsg);
      throw new Error(errorMsg);
    }
    
    return documents || [];
  } catch (error) {
    onLog?.(`Erreur lors de la récupération des documents: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
};

/**
 * Vérifie et analyse les documents lorsqu'aucun n'est trouvé pour l'indexation
 * @param onLog Fonction de callback pour les logs
 * @param forceReindex Si le mode force est activé
 */
export const analyzeNoDocumentsFound = async (
  onLog?: LogCallback,
  forceReindex = false
): Promise<void> => {
  // Vérification supplémentaire avec des détails SQL
  const { data: checkData, error: checkError } = await supabase
    .from('documents')
    .select('id, title, pinecone_indexed, content')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (!checkError && checkData && checkData.length > 0) {
    onLog?.(`Les 5 documents les plus récents dans la base:`);
    for (const doc of checkData) {
      const contentStatus = !doc.content ? 'VIDE' : 
                          (doc.content.length < 10 ? 'TRÈS COURT' : 
                           `${doc.content.length} caractères`);
                           
      onLog?.(`- Document "${doc.title}" (${doc.id.substring(0, 8)}): pinecone_indexed = ${doc.pinecone_indexed === null ? 'NULL' : doc.pinecone_indexed}, contenu: ${contentStatus}`);
    }
    
    if (forceReindex && checkData.length > 0) {
      onLog?.("Mode FORCE activé mais aucun document avec contenu trouvé. Vérifiez que vos documents ont bien un contenu non vide.");
    } else if (!forceReindex && checkData.every(doc => doc.pinecone_indexed === true)) {
      onLog?.("Tous les documents sont déjà marqués comme indexés dans Pinecone. Utilisez le mode FORCE pour les réindexer.");
    } else if (checkData.every(doc => !doc.content || doc.content === '')) {
      onLog?.("Tous les documents ont un contenu vide, ils ne peuvent pas être indexés.");
    } else {
      onLog?.("Certains documents ne sont pas indexés mais n'ont pas été récupérés par la requête, vérifiez les filtres.");
    }
  }
  
  // Essayer avec une requête plus simple comme dernier recours
  onLog?.("Tentative avec une requête plus simple...");
  const { data: simpleData, error: simpleError } = await supabase
    .from('documents')
    .select('id, title, pinecone_indexed')
    .is('pinecone_indexed', null)
    .limit(5);
    
  if (!simpleError && simpleData && simpleData.length > 0) {
    onLog?.(`Trouvé ${simpleData.length} documents avec pinecone_indexed NULL:`);
    for (const doc of simpleData) {
      onLog?.(`- Document "${doc.title}" (${doc.id.substring(0, 8)})`);
    }
  } else {
    onLog?.("Aucun document avec pinecone_indexed NULL trouvé");
  }
};
