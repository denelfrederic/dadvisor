
import React, { useState } from "react";
import { useEmbeddingsUpdate } from "../../knowledge-base/search/hooks/useEmbeddingsUpdate";
import SystemLogs from "./SystemLogs";
import DebugInfo from "./DebugInfo";
import ErrorAlert from "./components/ErrorAlert";
import ProgressSection from "./components/ProgressSection";
import HeaderSection from "./components/HeaderSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Repeat } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Composant principal pour le rapport d'indexation de documents
 * Affiche l'état de l'indexation Pinecone et les outils de diagnostic
 */
const DocumentReport: React.FC = () => {
  const { 
    updateDocumentEmbeddings, 
    isUpdating, 
    logs, 
    clearLogs, 
    exportLogs,
    errorSummary,
    progress,
    retryLastOperation,
    addLog
  } = useEmbeddingsUpdate();
  
  const [activeIndexTab, setActiveIndexTab] = useState<string>("standard");
  
  const handleGetDebugInfo = () => {
    addLog("Récupération des informations de diagnostic Pinecone...");
  };
  
  const handleStandardUpdate = () => {
    updateDocumentEmbeddings(false);
  };
  
  const handleForceUpdate = () => {
    updateDocumentEmbeddings(true);
  };
  
  return (
    <div className="space-y-6">
      {/* Section d'en-tête avec les actions principales */}
      <HeaderSection 
        onUpdateDocuments={handleStandardUpdate}
        onClearLogs={clearLogs}
        onExportLogs={exportLogs}
        isUpdating={isUpdating}
        hasLogs={logs.length > 0}
      />
      
      {/* Options d'indexation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Options d'indexation</CardTitle>
          <CardDescription>
            Choisissez le mode d'indexation des documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            value={activeIndexTab} 
            onValueChange={setActiveIndexTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="standard">Standard</TabsTrigger>
              <TabsTrigger value="force">Forcée</TabsTrigger>
            </TabsList>
            
            <TabsContent value="standard" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                L'indexation standard traite uniquement les documents qui n'ont pas encore été indexés dans Pinecone.
              </p>
              <Button 
                onClick={handleStandardUpdate}
                disabled={isUpdating}
                className="w-full"
              >
                Indexer nouveaux documents
              </Button>
            </TabsContent>
            
            <TabsContent value="force" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                L'indexation forcée traite tous les documents, même ceux déjà indexés dans Pinecone. Utile pour réindexer après une mise à jour de Pinecone.
              </p>
              <Button 
                onClick={handleForceUpdate}
                disabled={isUpdating}
                className="w-full"
                variant="outline"
              >
                <Repeat className="h-4 w-4 mr-2" />
                Réindexer TOUS les documents
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Affichage des erreurs avec solutions suggérées */}
      <ErrorAlert 
        errorSummary={errorSummary} 
        onRetry={retryLastOperation} 
      />

      {/* Barre de progression pour l'indexation */}
      <ProgressSection progress={progress} />

      {/* Outil de diagnostic Pinecone */}
      <DebugInfo onGetInfo={handleGetDebugInfo} />

      {/* Affichage des logs système */}
      <SystemLogs 
        logs={logs}
        onExport={exportLogs}
        onClear={clearLogs}
      />
    </div>
  );
};

export default DocumentReport;
