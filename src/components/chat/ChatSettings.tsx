
import React from "react";
import { Button } from "@/components/ui/button";

interface ChatSettingsProps {
  useKnowledgeBase: boolean;
  setUseKnowledgeBase: (use: boolean) => void;
  clearConversation: () => void;
}

const ChatSettings = ({ useKnowledgeBase, setUseKnowledgeBase, clearConversation }: ChatSettingsProps) => {
  return (
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
  );
};

export default ChatSettings;
