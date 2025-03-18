
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

// New document-related types
export interface DocumentSearchResult {
  id: string;
  title?: string;
  content: string;
  type?: string;
  size?: number;
  source?: string;
  timestamp?: string;
  score?: number;
  matchCount?: number;
}

export interface DocumentUploaderProps {
  onUploadComplete: () => void;
}

export interface DocumentManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface DocumentStatsProps {
  stats: {
    count: number;
    types: Record<string, number>;
    totalSize: number;
  };
}
