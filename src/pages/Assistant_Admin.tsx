
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, Database, Search, PenSquare, Plus, Upload, ArrowRight, BookOpen } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import KnowledgeSearch from "@/components/knowledge-base/KnowledgeSearch";
import KnowledgeManager from "@/components/knowledge-base/KnowledgeManager";
import DocumentManager from "@/components/document/DocumentManager";

const Assistant_Admin = () => {
  const [activeTab, setActiveTab] = useState("search");
  const [isDocManagerOpen, setIsDocManagerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-radial py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Database size={24} className="text-dadvisor-blue" />
            <h1 className="text-3xl font-bold">Administration IA</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsDocManagerOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload size={18} />
              Gestionnaire Documents
            </Button>
            <Button variant="outline" asChild className="flex items-center gap-2">
              <Link to="/">
                <Home size={18} />
                Accueil
              </Link>
            </Button>
          </div>
        </div>
        
        <p className="text-muted-foreground text-center mb-8">
          Gérez votre base de connaissances financières et interagissez avec l'IA pour obtenir des réponses personnalisées.
        </p>
        
        <div className="border rounded-lg p-6 bg-card shadow-sm">
          <Tabs defaultValue="search" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search size={16} />
                Recherche & Consultation
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <PenSquare size={16} />
                Gestion Base de Connaissances
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
      
      <DocumentManager 
        isOpen={isDocManagerOpen}
        onClose={() => setIsDocManagerOpen(false)}
      />
    </div>
  );
};

export default Assistant_Admin;
