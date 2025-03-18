
import { Bot } from "lucide-react";

interface ChatHeaderProps {
  title: string;
}

const ChatHeader = ({ title }: ChatHeaderProps) => {
  return (
    <div className="bg-dadvisor-navy p-4 text-white flex items-center gap-3">
      <Bot size={24} />
      <h2 className="text-xl font-medium">{title}</h2>
    </div>
  );
};

export default ChatHeader;
