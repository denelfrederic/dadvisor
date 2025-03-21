
import { useState, useRef } from "react";
import { toast } from "@/components/ui/use-toast";
import { Message } from "../types";
import { sendMessageToGemini } from "../services";
import { retrieveContext } from "../services/contextRetrievalService";

export const useChatState = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const clearConversation = () => {
    setMessages([]);
    toast({
      title: "Conversation effacée",
      description: "Votre conversation a été réinitialisée."
    });
  };
  
  const handleSendMessage = async (input: string) => {
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Rechercher dans les documents
      let additionalContext = "";
      let debugInfo = [];
      
      // Utiliser le service dédié pour récupérer le contexte
      const contextResult = await retrieveContext(input);
      additionalContext = contextResult.context;
      debugInfo = contextResult.debugInfo;
      
      console.log("Contexte additionnel:", additionalContext ? "Présent" : "Absent");
      console.log("Debug info:", debugInfo);
      
      const response = await sendMessageToGemini(input, messages, true, additionalContext);
      
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error: any) {
      console.error("Erreur lors de l'appel à l'API Gemini:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la communication avec l'assistant IA DADVISOR."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    messagesEndRef,
    clearConversation,
    handleSendMessage
  };
};
