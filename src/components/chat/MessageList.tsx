
import { useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import MessageItem from "./MessageItem";
import ChatEmpty from "./ChatEmpty";
import { Message, MessageListProps } from "./types";

const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <ChatEmpty 
          message="Comment puis-je vous aider avec vos questions financières aujourd'hui?" 
          subMessage="Posez-moi une question pour commencer la conversation."
        />
      ) : (
        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageItem key={index} message={message} />
          ))}
        </AnimatePresence>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
