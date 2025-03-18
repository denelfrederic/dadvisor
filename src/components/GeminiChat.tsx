
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Message } from "./chat/types";
import ChatHeader from "./chat/ChatHeader";
import MessageList from "./chat/MessageList";
import ChatForm from "./chat/ChatForm";
import { sendMessageToGemini, getDocumentStats } from "./chat/GeminiService";
import DocumentManager from "./document/DocumentManager";
import { Database, Info } from "lucide-react";

const GeminiChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDocManagerOpen, setIsDocManagerOpen] = useState(false);
  const docStats = getDocumentStats();

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
      <div className="flex justify-between items-center">
        <ChatHeader title="Assistant IA Financier" />
        <div className="bg-dadvisor-navy p-4 text-white flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:text-white/80 hover:bg-white/10"
            onClick={() => setIsDocManagerOpen(true)}
          >
            <Database className="h-4 w-4 mr-2" />
            {docStats.count > 0 ? `${docStats.count} documents` : "Gérer les documents"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-white/80 hover:bg-white/10"
            title="Informations sur le RAG"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatForm onSendMessage={handleSendMessage} isLoading={isLoading} />
      
      <DocumentManager 
        isOpen={isDocManagerOpen}
        onClose={() => setIsDocManagerOpen(false)}
      />
    </div>
  );
};

export default GeminiChat;
