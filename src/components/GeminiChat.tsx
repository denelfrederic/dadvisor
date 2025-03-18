
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Loader2, Bot, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const GeminiChat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Format les messages pour l'API Gemini
  const formatMessagesForApi = (msgs: Message[]) => {
    return msgs.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      content: msg.content
    }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      const historyForApi = formatMessagesForApi(messages);
      
      const { data, error } = await supabase.functions.invoke("gemini-chat", {
        body: {
          prompt: input,
          history: historyForApi
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
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
      <div className="bg-dadvisor-navy p-4 text-white flex items-center gap-3">
        <Bot size={24} />
        <h2 className="text-xl font-medium">Assistant IA Financier</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-muted-foreground">
            <div>
              <Bot size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">
                Comment puis-je vous aider avec vos questions financières aujourd'hui?
              </p>
              <p className="text-sm mt-2">
                Posez-moi une question pour commencer la conversation.
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                    message.role === "user" ? "bg-dadvisor-blue" : "bg-dadvisor-navy"
                  } text-white`}>
                    {message.role === "user" ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className={`py-3 px-4 rounded-xl ${
                    message.role === "user" 
                      ? "bg-dadvisor-blue text-white" 
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.role === "user" ? "text-blue-100" : "text-gray-400"
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t bg-muted/30">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez une question financière..."
            className="min-h-[60px] flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            className="h-auto" 
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Appuyez sur Entrée pour envoyer, Maj+Entrée pour un saut de ligne.
        </p>
      </form>
    </div>
  );
};

export default GeminiChat;
