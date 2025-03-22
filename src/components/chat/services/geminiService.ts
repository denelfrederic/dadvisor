
import { supabase } from "@/integrations/supabase/client";
import { Message } from '../types';
import { formatMessagesForApi } from './messageService';

/**
 * Envoie un message à l'API OpenAI (modèle GPT-4o) via Edge Function
 * @param prompt Le message à envoyer
 * @param history L'historique des messages
 * @param useLocalSearch Paramètre conservé pour compatibilité, non utilisé
 * @param additionalContext Paramètre conservé pour compatibilité, non utilisé
 * @returns La réponse de l'API
 */
export const sendMessageToGemini = async (
  prompt: string, 
  history: Message[] = [], 
  useLocalSearch = false,
  additionalContext = ""
) => {
  try {
    console.log("Envoi du message à l'agent DADVISOR:", prompt.substring(0, 100) + "...");
    
    // Format history pour l'API
    const historyForApi = formatMessagesForApi(history);
    
    // Appel à l'Edge Function Supabase
    const { data, error } = await supabase.functions.invoke("gemini-chat", {
      body: {
        prompt: prompt,
        history: historyForApi,
        useRAG: false
      }
    });
    
    if (error) {
      throw new Error(`Erreur Supabase: ${error.message}`);
    }
    
    return data.response;
  } catch (error) {
    console.error("Erreur lors de l'envoi du message DADVISOR:", error);
    throw error;
  }
};

// Fonction maintenue pour compatibilité avec les interfaces existantes
export const getDocumentStats = async () => {
  return { count: 0, types: {}, totalSize: 0 };
};
