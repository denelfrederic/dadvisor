
import { useState, useEffect } from "react";
import ChatHeader from "./chat/ChatHeader";
import MessageList from "./chat/MessageList";
import ChatForm from "./chat/ChatForm";
import DocumentManager from "./document/DocumentManager";
import { useChatState } from "./chat/hooks/useChatState";
import { useDocumentStats } from "./chat/hooks/useDocumentStats";
import ChatSettings from "./chat/ChatSettings";
import ChatToolbar from "./chat/ChatToolbar";

const GeminiChat = () => {
  const {
    messages,
    isLoading,
    messagesEndRef,
    clearConversation,
    handleSendMessage
  } = useChatState();
  
  const {
    stats,
    isDocManagerOpen,
    setIsDocManagerOpen
  } = useDocumentStats();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col h-[85vh] max-w-4xl mx-auto bg-gradient-radial rounded-xl overflow-hidden border shadow-lg">
      <div className="flex justify-between items-center">
        <ChatHeader title="Assistant IA DADVISOR (GPT-4o)" />
        <ChatToolbar 
          docCount={stats.count} 
          onOpenDocManager={() => setIsDocManagerOpen(true)}
          onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        />
      </div>

      {isSettingsOpen && (
        <ChatSettings 
          clearConversation={clearConversation}
        />
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
