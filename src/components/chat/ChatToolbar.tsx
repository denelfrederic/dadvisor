
import React from "react";
import { Button } from "@/components/ui/button";
import { Database, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface ChatToolbarProps {
  docCount: number;
  onOpenDocManager: () => void;
  onToggleSettings: () => void;
}

const ChatToolbar = ({ docCount, onOpenDocManager, onToggleSettings }: ChatToolbarProps) => {
  return (
    <div className="bg-dadvisor-navy p-4 text-white flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-white hover:text-white/80 hover:bg-white/10"
        onClick={onOpenDocManager}
      >
        <Database className="h-4 w-4 mr-2" />
        {docCount > 0 ? `${docCount} documents` : "Gérer les documents"}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:text-white/80 hover:bg-white/10"
        asChild
        title="Paramètres"
      >
        <Link to="/adminllm">
          <Settings className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
};

export default ChatToolbar;
