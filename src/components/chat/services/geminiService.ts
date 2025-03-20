
import { supabase } from "@/integrations/supabase/client";
import { Message } from '../types';
import { searchLocalDocuments } from './document/searchService';
import { formatMessagesForApi } from './messageService';

/**
 * Envoie un message à l'API Gemini (modèle gemini-1.5-flash)
 * @param prompt Le message à envoyer
 * @param history L'historique des messages
 * @param useLocalSearch Indique si on doit chercher dans les documents locaux
 * @param additionalContext Contexte supplémentaire à fournir
 * @returns La réponse de l'API
 */
export const sendMessageToGemini = async (
  prompt: string, 
  history: Message[], 
  useLocalSearch = false,
  additionalContext = ""
) => {
  try {
    let contextFromDocuments = "";
    let sourcesUsed = [];
    
    // Si on utilise la recherche locale et qu'aucun contexte n'est fourni
    if (useLocalSearch && !additionalContext) {
      // Recherche dans la base de documents
      const relevantDocuments = await searchLocalDocuments(prompt);
      
      if (relevantDocuments.length > 0) {
        contextFromDocuments = "Contexte DADVISOR depuis nos documents internes:\n\n" + relevantDocuments
          .map((doc, index) => {
            sourcesUsed.push(doc.title || 'Document sans titre');
            return `Document ${index + 1}: ${doc.title || 'Sans titre'}\nSource: ${doc.source || 'Base DADVISOR'}\nContenu: ${doc.content.substring(0, 1000)}${doc.content.length > 1000 ? '...' : ''}`;
          })
          .join('\n\n') + '\n\n';
        
        console.log("Documents pertinents trouvés:", relevantDocuments.length);
      } else {
        console.log("Aucun document pertinent trouvé");
      }
    } else if (additionalContext) {
      // Utiliser le contexte fourni directement
      contextFromDocuments = additionalContext;
    }
    
    // Format history for API
    const historyForApi = formatMessagesForApi(history);
    
    // Enhance the prompt with document context if available
    const enhancedPrompt = useLocalSearch && (contextFromDocuments || additionalContext)
      ? `${contextFromDocuments}\nQuestion de l'utilisateur DADVISOR: ${prompt}\n\nVeuillez utiliser les informations fournies dans le contexte ci-dessus pour répondre en tant qu'assistant DADVISOR. Si les informations ne contiennent pas de réponse pertinente pour la question, veuillez répondre au mieux en utilisant vos connaissances générales.`
      : prompt;
    
    // Log what we're sending
    console.log("Envoi à l'API avec contexte DADVISOR:", useLocalSearch && (contextFromDocuments.length > 0 || additionalContext.length > 0));
    
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
      throw new Error(`Erreur Supabase: ${error.message}`);
    }
    
    // Log sources used
    if (sourcesUsed.length > 0) {
      console.log("Sources DADVISOR utilisées:", sourcesUsed.join(", "));
    }
    
    return data.response;
  } catch (error) {
    console.error("Erreur lors de l'envoi du message DADVISOR:", error);
    throw error;
  }
};

export const getDocumentStats = async () => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('type, size');
    
    if (error) throw error;
    
    if (!data) return { count: 0, types: {}, totalSize: 0 };
    
    // Calculer les statistiques
    const types: Record<string, number> = {};
    let totalSize = 0;
    
    data.forEach(doc => {
      // Compter par type
      if (doc.type) {
        types[doc.type] = (types[doc.type] || 0) + 1;
      } else {
        types['unknown'] = (types['unknown'] || 0) + 1;
      }
      
      // Calculer la taille totale
      if (doc.size) {
        totalSize += doc.size;
      }
    });
    
    return {
      count: data.length,
      types,
      totalSize
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return { count: 0, types: {}, totalSize: 0 };
  }
};
