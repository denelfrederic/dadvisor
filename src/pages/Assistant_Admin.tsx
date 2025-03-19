import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, Database, Search, PenSquare, ArrowRight, BarChart3, Brain, FileText, Upload, Settings } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import KnowledgeSearch from "@/components/knowledge-base/KnowledgeSearch";
import KnowledgeManager from "@/components/knowledge-base/KnowledgeManager";
import DocumentManager from "@/components/document/DocumentManager";
import CombinedReportView from "@/components/knowledge-base/reports/CombinedReport";
import EmbeddingMaintenance from "@/components/knowledge-base/admin/EmbeddingMaintenance";

const Assistant_Admin = () => {
  const [activeTab, setActiveTab] = useState("search");
  const [isDocManagerOpen, setIsDocManagerOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isEmbeddingMaintenanceOpen, setIsEmbeddingMaintenanceOpen] = useState(false);

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
              onClick={() => setIsEmbeddingMaintenanceOpen(true)}
              className="flex items-center gap-2"
            >
              <Brain size={18} />
              Maintenance Embeddings
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsReportOpen(true)}
              className="flex items-center gap-2"
            >
              <BarChart3 size={18} />
              Rapport d'indexation
            </Button>
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
            <Button 
              variant="outline" 
              asChild
              className="flex items-center gap-2"
            >
              <Link to="/pinecone-config">
                <Settings size={18} />
                Configuration Pinecone
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
      
      {/* Modal pour le rapport d'indexation combiné */}
      {isReportOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Rapport d'indexation
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setIsReportOpen(false)}>
                ✕
              </Button>
            </div>
            <CombinedReportView />
          </div>
        </div>
      )}
      
      {/* Modal pour la maintenance des embeddings */}
      {isEmbeddingMaintenanceOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Maintenance des embeddings
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setIsEmbeddingMaintenanceOpen(false)}>
                ✕
              </Button>
            </div>
            <EmbeddingMaintenance />
          </div>
        </div>
      )}
    </div>
  );
};

export default Assistant_Admin;
