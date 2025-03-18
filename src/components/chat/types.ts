
export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatFormProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export interface MessageItemProps {
  message: Message;
}

export interface ChatHeaderProps {
  title: string;
}

export interface EmptyStateProps {
  message: string;
  subMessage: string;
}
