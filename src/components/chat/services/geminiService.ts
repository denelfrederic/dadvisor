
import { supabase } from "@/integrations/supabase/client";
import { Message } from '../types';
import { searchLocalDocuments } from './document/searchService';
import { formatMessagesForApi } from './messageService';

export const sendMessageToGemini = async (
  prompt: string, 
  history: Message[], 
  useLocalSearch = false,
  additionalContext = ""
) => {
  try {
    let contextFromDocuments = "";
    
    // Si on utilise la recherche locale
    if (useLocalSearch) {
      // Recherche dans la base de documents
      const relevantDocuments = await searchLocalDocuments(prompt);
      
      if (relevantDocuments.length > 0) {
        contextFromDocuments = `Contexte depuis nos documents internes:\n\n${relevantDocuments
          .map(doc => `Document: ${doc.title || 'Sans titre'}\nSource: ${doc.source || 'Base locale'}\nContenu: ${doc.content.substring(0, 1000)}${doc.content.length > 1000 ? '...' : ''}`)
          .join('\n\n')}\n\n`;
        
        console.log("Documents pertinents trouvés:", relevantDocuments.length);
      } else {
        console.log("Aucun document pertinent trouvé");
      }
    }
    
    // Ajouter le contexte supplémentaire s'il est fourni
    if (additionalContext) {
      contextFromDocuments += `\nContexte supplémentaire de la base de connaissances:\n${additionalContext}\n\n`;
    }
    
    // Format history for API
    const historyForApi = formatMessagesForApi(history);
    
    // Enhance the prompt with document context if available
    const enhancedPrompt = useLocalSearch && (contextFromDocuments || additionalContext)
      ? `${contextFromDocuments}\nQuestion de l'utilisateur: ${prompt}\n\nVeuillez utiliser les informations fournies dans le contexte ci-dessus pour répondre. Si les informations ne contiennent pas de réponse pertinente pour la question, veuillez répondre au mieux en utilisant vos connaissances générales.`
      : prompt;
    
    // Log what we're sending
    console.log("Envoi à l'API avec RAG:", useLocalSearch && (contextFromDocuments.length > 0 || additionalContext.length > 0));
    
    // Invoke the Gemini Edge Function
    const { data, error } = await supabase.functions.invoke("gemini-chat", {
      body: {
        prompt: enhancedPrompt,
        history: historyForApi,
        useRAG: useLocalSearch && (contextFromDocuments.length > 0 || additionalContext.length > 0),
        documentContext: useLocalSearch && (contextFromDocuments.length > 0 || additionalContext.length > 0) ? contextFromDocuments : null
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data.response;
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    throw error;
  }
};
