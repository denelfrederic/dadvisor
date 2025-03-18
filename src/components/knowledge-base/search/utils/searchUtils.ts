
import { KnowledgeEntry } from "../../types";
import { useKnowledgeBaseService } from "../../services";
import { sendMessageToGemini } from "../../../chat/services";
import { searchLocalDocuments } from "../../../chat/services/documentService";

export const formatKnowledgeBaseContext = (results: KnowledgeEntry[]) => {
  if (results.length === 0) return { context: "", sources: [] };
  
  // Format structured context for the knowledge base
  const context = "Information de notre base de connaissances :\n\n" + 
    results
      .map((entry, index) => 
        `[Base de connaissances ${index + 1}]\nQuestion: ${entry.question}\nRéponse: ${entry.answer}`)
      .join('\n\n');
  
  // Sources more descriptive
  const sources = results.map(entry => 
    `Base de connaissances: ${entry.question}`
  );
  
  return { context, sources };
};

export const formatDocumentContext = (docResults: any[]) => {
  if (docResults.length === 0) return { context: "", sources: [] };
  
  // Format structured context for documents
  const context = "Information de nos documents :\n\n" + 
    docResults
      .map((doc, index) => 
        `[Document ${index + 1}: ${doc.title || 'Sans titre'}]\n${doc.content.substring(0, 1000)}${doc.content.length > 1000 ? '...' : ''}`)
      .join('\n\n');
  
  // Add document sources
  const sources = docResults.map(doc => 
    `Document: ${doc.title || 'Sans titre'} (Score: ${doc.score?.toFixed(2) || 'N/A'})`
  );
  
  return { context, sources };
};

export const searchKnowledgeBase = async (kb: ReturnType<typeof useKnowledgeBaseService>, query: string) => {
  const results = await kb.searchEntries(query);
  return formatKnowledgeBaseContext(results);
};

export const searchDocuments = async (query: string) => {
  const results = await searchLocalDocuments(query);
  return formatDocumentContext(results);
};

export const buildPromptForLocalContent = (query: string, hasContext: boolean, context: string) => {
  if (hasContext) {
    return "Analyse soigneusement les informations fournies de notre base de connaissances ET de nos documents locaux, puis utilise-les pour répondre à la question suivante. " +
      "Si les informations sont pertinentes, base ta réponse dessus en priorité. Sinon, utilise tes connaissances générales.\n\n" +
      "Question: " + query;
  }
  return query;
};
