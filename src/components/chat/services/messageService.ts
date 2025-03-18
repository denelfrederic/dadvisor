
import { Message } from '../types';

// Format les messages pour l'API Gemini
export const formatMessagesForApi = (msgs: Message[]) => {
  return msgs.map(msg => ({
    role: msg.role === "user" ? "user" : "model",
    content: msg.content
  }));
};
