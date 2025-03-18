
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, Database, Search, PenSquare, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import KnowledgeSearch from "@/components/knowledge-base/KnowledgeSearch";
import KnowledgeManager from "@/components/knowledge-base/KnowledgeManager";

const GeminiAssistant = () => {
  const [activeTab, setActiveTab] = useState("search");

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
        
        <div className="border rounded-lg p-6 bg-card shadow-sm">
          <Tabs defaultValue="search" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search size={16} />
                Recherche
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <PenSquare size={16} />
                Gérer Base de Connaissances
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="search">
              <KnowledgeSearch />
            </TabsContent>
            
            <TabsContent value="manage">
              <KnowledgeManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default GeminiAssistant;
