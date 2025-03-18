
import { searchKnowledgeBaseSemantically } from "../../knowledge-base/search/utils/searchUtils";
import { searchLocalDocuments } from "./document/searchService";
import { formatDocumentContext } from "../../knowledge-base/search/utils/searchUtils";
import { KnowledgeBaseService } from "../../knowledge-base/services/types";

interface ContextResult {
  context: string;
  debugInfo: string[];
}

/**
 * Service for retrieving context from knowledge base and documents
 */
export const retrieveContext = async (
  input: string, 
  kb: KnowledgeBaseService
): Promise<ContextResult> => {
  let additionalContext = "";
  let debugInfo: string[] = [];
  
  try {
    debugInfo.push("Recherche dans la base de connaissances et les documents...");
    
    // Recherche parallèle pour une meilleure performance
    const [kbResults, docResults] = await Promise.all([
      searchKnowledgeBaseSemantically(kb, input),
      searchLocalDocuments(input)
    ]);
    
    // Formater les résultats de KB pour obtenir le contexte
    const kbContext = kbResults.context || "";
    const kbSources = kbResults.sources || [];
    
    // Formater les résultats des documents pour obtenir le contexte
    const formattedDocResults = formatDocumentContext(docResults);
    const docContext = formattedDocResults.context || "";
    const docSources = formattedDocResults.sources || [];
    
    if (kbContext || docContext) {
      additionalContext = (kbContext ? kbContext + "\n\n" : "") + 
                          (docContext ? docContext : "");
      
      debugInfo.push(`Trouvé ${kbSources.length} entrées dans la base de connaissances`);
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
