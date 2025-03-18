
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, Database, Cloud } from "lucide-react";
import GeminiChat from "@/components/GeminiChat";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import LocalKnowledgeBase from "@/components/knowledge-base/LocalKnowledgeBase";

const GeminiAssistant = () => {
  const [activeTab, setActiveTab] = useState("cloud");

  return (
    <div className="min-h-screen bg-gradient-radial py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Assistant IA Financier</h1>
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link to="/">
              <Home size={18} />
              Accueil
            </Link>
          </Button>
        </div>
        
        <p className="text-muted-foreground text-center mb-8">
          Posez vos questions financières et obtenez des réponses personnalisées alimentées par l'IA.
        </p>
        
        <Tabs defaultValue="cloud" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="cloud" className="flex items-center gap-2">
              <Cloud size={16} />
              Gemini (Cloud)
            </TabsTrigger>
            <TabsTrigger value="local" className="flex items-center gap-2">
              <Database size={16} />
              Base de connaissances locale
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="cloud" className="mt-0">
            <GeminiChat />
          </TabsContent>
          
          <TabsContent value="local" className="mt-0">
            <LocalKnowledgeBase />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GeminiAssistant;
