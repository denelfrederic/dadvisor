
import { supabase } from "@/integrations/supabase/client";
import { Message } from "./types";

// Format les messages pour l'API Gemini
export const formatMessagesForApi = (msgs: Message[]) => {
  return msgs.map(msg => ({
    role: msg.role === "user" ? "user" : "model",
    content: msg.content
  }));
};

export const sendMessageToGemini = async (prompt: string, history: Message[]) => {
  const historyForApi = formatMessagesForApi(history);
  
  const { data, error } = await supabase.functions.invoke("gemini-chat", {
    body: {
      prompt,
      history: historyForApi
    }
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data.response;
};
