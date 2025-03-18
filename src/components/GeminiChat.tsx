
import { useState, useEffect, useRef } from "react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Message } from "./chat/types";
import ChatHeader from "./chat/ChatHeader";
import MessageList from "./chat/MessageList";
import ChatForm from "./chat/ChatForm";
import { sendMessageToGemini } from "./chat/services";
import DocumentManager from "./document/DocumentManager";
import { Database, Info, BookOpen, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKnowledgeBaseService } from "./knowledge-base/services";
import { searchKnowledgeBaseSemantically } from "./knowledge-base/search/utils/searchUtils";
import { searchLocalDocuments } from "./chat/services/document/searchService";
import { formatDocumentContext } from "./knowledge-base/search/utils/searchUtils";

const GeminiChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDocManagerOpen, setIsDocManagerOpen] = useState(false);
  const [stats, setStats] = useState({ count: 0, types: {}, totalSize: 0 });
  const [activeTab, setActiveTab] = useState("chat");
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const kb = useKnowledgeBaseService();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDocStats = async () => {
      try {
        const { data, error } = await fetch('/api/documents/stats').then(res => res.json());
        if (error) throw error;
        setStats(data || { count: 0, types: {}, totalSize: 0 });
      } catch (error) {
        console.error("Error fetching document stats:", error);
      }
    };
    
    fetchDocStats();
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (input: string) => {
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Rechercher dans la base de connaissances et les documents si l'option est activée
      let additionalContext = "";
      let debugInfo = [];
      
      if (useKnowledgeBase) {
        try {
          debugInfo.push("Recherche dans la base de connaissances et les documents...");
          
          // Recherche parallèle pour une meilleure performance
          const [kbResults, docResults] = await Promise.all([
            searchKnowledgeBaseSemantically(kb, input),
            searchLocalDocuments(input)
          ]);
          
          // Formater les résultats de KB pour obtenir le contexte
          const kbContext = kbResults.context || "";
          const kbSources = kbResults.sources || [];
          
          // Formater les résultats des documents pour obtenir le contexte
          const formattedDocResults = formatDocumentContext(docResults);
          const docContext = formattedDocResults.context || "";
          const docSources = formattedDocResults.sources || [];
          
          if (kbContext || docContext) {
            additionalContext = (kbContext ? kbContext + "\n\n" : "") + 
                               (docContext ? docContext : "");
            
            debugInfo.push(`Trouvé ${kbSources.length} entrées dans la base de connaissances`);
            debugInfo.push(`Trouvé ${docSources.length} extraits de documents`);
          } else {
            debugInfo.push("Aucune information pertinente trouvée dans la base locale");
          }
        } catch (searchError) {
          console.error("Erreur lors de la recherche locale:", searchError);
          debugInfo.push(`Erreur de recherche: ${searchError.message}`);
        }
      }
      
      console.log("Contexte additionnel:", additionalContext ? "Présent" : "Absent");
      console.log("Debug info:", debugInfo);
      
      const response = await sendMessageToGemini(input, messages, useKnowledgeBase, additionalContext);
      
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

  const clearConversation = () => {
    setMessages([]);
    toast({
      title: "Conversation effacée",
      description: "Votre conversation a été réinitialisée."
    });
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-4xl mx-auto bg-gradient-radial rounded-xl overflow-hidden border shadow-lg">
      <div className="flex justify-between items-center">
        <ChatHeader title="Assistant IA DADVISOR" />
        <div className="bg-dadvisor-navy p-4 text-white flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:text-white/80 hover:bg-white/10"
            onClick={() => setIsDocManagerOpen(true)}
          >
            <Database className="h-4 w-4 mr-2" />
            {stats.count > 0 ? `${stats.count} documents` : "Gérer les documents"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-white/80 hover:bg-white/10"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            title="Paramètres"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isSettingsOpen && (
        <div className="p-4 bg-muted/20 border-b">
          <h3 className="text-sm font-medium mb-2">Paramètres de l'assistant</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useKnowledgeBase"
                checked={useKnowledgeBase}
                onChange={(e) => setUseKnowledgeBase(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="useKnowledgeBase" className="text-sm">
                Utiliser la base de connaissances DADVISOR
              </label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearConversation}
              className="text-xs"
            >
              Effacer la conversation
            </Button>
          </div>
        </div>
      )}
      
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatForm onSendMessage={handleSendMessage} isLoading={isLoading} />
      <div ref={messagesEndRef} />
      
      <DocumentManager 
        isOpen={isDocManagerOpen}
        onClose={() => setIsDocManagerOpen(false)}
      />
    </div>
  );
};

export default GeminiChat;
