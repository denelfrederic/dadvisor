
import React from "react";
import { Button } from "@/components/ui/button";

interface ChatSettingsProps {
  clearConversation: () => void;
}

const ChatSettings = ({ clearConversation }: ChatSettingsProps) => {
  return (
    <div className="p-4 bg-muted/20 border-b">
      <h3 className="text-sm font-medium mb-2">Paramètres de l'assistant</h3>
      <div className="flex items-center justify-end">
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
  );
};

export default ChatSettings;
