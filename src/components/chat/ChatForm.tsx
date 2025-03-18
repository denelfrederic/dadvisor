
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Loader2 } from "lucide-react";
import { ChatFormProps } from "./types";

const ChatForm = ({ onSendMessage, isLoading }: ChatFormProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    onSendMessage(input);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-muted/30">
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez une question financière..."
          className="min-h-[60px] flex-1 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          className="h-auto" 
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Appuyez sur Entrée pour envoyer, Maj+Entrée pour un saut de ligne.
      </p>
    </form>
  );
};

export default ChatForm;
