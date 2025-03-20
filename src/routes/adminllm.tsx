
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Settings, MessageSquare, LayoutDashboard } from "lucide-react";
import EmbeddingMaintenance from "@/components/knowledge-base/admin/EmbeddingMaintenance";
import { Separator } from "@/components/ui/separator";
import PineconeSettings from "@/components/knowledge-base/admin/PineconeSettings";

/**
 * Page d'administration pour la gestion des modèles LLM et Pinecone
 */
export default function AdminLLMPage() {
  return (
    <div className="container py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuration LLM</h1>
        <p className="text-muted-foreground">
          Gérez les paramètres d'IA, embeddings et indexation vectorielle
        </p>
      </div>
      
      <Tabs defaultValue="pinecone">
        <TabsList className="mb-4">
          <TabsTrigger value="pinecone">
            <Database className="h-4 w-4 mr-2" />
            Pinecone
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="llm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Modèles
          </TabsTrigger>
          <TabsTrigger value="usage">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Utilisation
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pinecone" className="space-y-6">
          <PineconeSettings />
          
          <Separator className="my-6" />
          
          <EmbeddingMaintenance />
        </TabsContent>
        
        <TabsContent value="config">
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">Configuration des modèles (à venir)</p>
          </div>
        </TabsContent>
        
        <TabsContent value="llm">
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">Gestion des modèles LLM (à venir)</p>
          </div>
        </TabsContent>
        
        <TabsContent value="usage">
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">Statistiques d'utilisation (à venir)</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
