
import { supabase } from "@/integrations/supabase/client";
import { Message } from '../types';
import { searchLocalDocuments } from './documentService';
import { formatMessagesForApi } from './messageService';

export const sendMessageToGemini = async (prompt: string, history: Message[], useLocalSearch = false) => {
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
    
    // Format history for API
    const historyForApi = formatMessagesForApi(history);
    
    // Enhance the prompt with document context if available
    const enhancedPrompt = useLocalSearch && contextFromDocuments 
      ? `${contextFromDocuments}\nQuestion de l'utilisateur: ${prompt}\n\nVeuillez utiliser uniquement les informations fournies dans le contexte ci-dessus pour répondre. Si les documents ne contiennent pas d'information pertinente pour la question, veuillez répondre: "Aucune information à ce sujet dans nos documents internes."`
      : prompt;
    
    // Log what we're sending
    console.log("Envoi à l'API avec RAG:", useLocalSearch && contextFromDocuments.length > 0);
    
    // Invoke the Gemini Edge Function
    const { data, error } = await supabase.functions.invoke("gemini-chat", {
      body: {
        prompt: enhancedPrompt,
        history: historyForApi,
        useRAG: useLocalSearch && contextFromDocuments.length > 0,
        documentContext: useLocalSearch && contextFromDocuments.length > 0 ? contextFromDocuments : null
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
