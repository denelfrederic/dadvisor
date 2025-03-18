
import { Bot } from "lucide-react";

interface EmptyStateProps {
  message: string;
  subMessage: string;
}

const ChatEmpty = ({ message, subMessage }: EmptyStateProps) => {
  return (
    <div className="h-full flex items-center justify-center text-center text-muted-foreground">
      <div>
        <Bot size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-lg">{message}</p>
        <p className="text-sm mt-2">{subMessage}</p>
      </div>
    </div>
  );
};

export default ChatEmpty;
