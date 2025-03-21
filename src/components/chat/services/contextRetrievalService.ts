
import { searchLocalDocuments } from "./document/searchService";
import { formatDocumentContext } from "../../knowledge-base/search/utils/searchUtils";

interface ContextResult {
  context: string;
  debugInfo: string[];
}

/**
 * Service pour récupérer le contexte des documents seulement
 * Version simplifiée sans base de connaissances
 */
export const retrieveContext = async (
  input: string
): Promise<ContextResult> => {
  let additionalContext = "";
  let debugInfo: string[] = [];
  
  try {
    debugInfo.push("Recherche dans les documents...");
    
    // Recherche uniquement dans les documents (pas de base de connaissances)
    const docResults = await searchLocalDocuments(input);
    
    // Formater les résultats des documents pour obtenir le contexte
    const formattedDocResults = formatDocumentContext(docResults);
    const docContext = formattedDocResults.context || "";
    const docSources = formattedDocResults.sources || [];
    
    if (docContext) {
      additionalContext = docContext;
      debugInfo.push(`Trouvé ${docSources.length} extraits de documents`);
    } else {
      debugInfo.push("Aucune information pertinente trouvée dans la base locale");
    }
  } catch (searchError) {
    console.error("Erreur lors de la recherche locale:", searchError);
    debugInfo.push(`Erreur de recherche: ${searchError.message}`);
  }
  
  return {
    context: additionalContext,
    debugInfo
  };
};
