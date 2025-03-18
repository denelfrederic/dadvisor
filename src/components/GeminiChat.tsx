
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Message } from "./chat/types";
import ChatHeader from "./chat/ChatHeader";
import MessageList from "./chat/MessageList";
import ChatForm from "./chat/ChatForm";
import { sendMessageToGemini } from "./chat/GeminiService";

const GeminiChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (input: string) => {
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const response = await sendMessageToGemini(input, messages);
      
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
        description: error.message || "Une erreur s'est produite lors de la communication avec l'assistant IA."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-4xl mx-auto bg-gradient-radial rounded-xl overflow-hidden border shadow-lg">
      <ChatHeader title="Assistant IA Financier" />
      <MessageList messages={messages} />
      <ChatForm onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default GeminiChat;
