
import { useState, useRef } from "react";
import { toast } from "@/components/ui/use-toast";
import { Message } from "../types";
import { sendMessageToGemini } from "../services";
import { searchKnowledgeBaseSemantically } from "../../knowledge-base/search/utils/searchUtils";
import { searchLocalDocuments } from "../services/document/searchService";
import { formatDocumentContext } from "../../knowledge-base/search/utils/searchUtils";
import { useKnowledgeBaseService } from "../../knowledge-base/services";

export const useChatState = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useKnowledgeBase, setUseKnowledgeBase] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const kb = useKnowledgeBaseService();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

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

  return {
    messages,
    isLoading,
    useKnowledgeBase,
    setUseKnowledgeBase,
    messagesEndRef,
    clearConversation,
    handleSendMessage
  };
};
