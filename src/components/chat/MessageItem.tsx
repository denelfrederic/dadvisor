
import { Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import { Message } from "./types";

interface MessageItemProps {
  message: Message;
}

const MessageItem = ({ message }: MessageItemProps) => {
  return (
    <motion.div 
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
  );
};

export default MessageItem;
