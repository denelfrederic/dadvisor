
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEmbeddingsUpdate } from "../search/hooks/useEmbeddingsUpdate";
import { Database, RefreshCcw, AlertCircle, Info, Download, HelpCircle, Repeat, Server, Settings } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ErrorAlert from "@/components/document/report/components/ErrorAlert";

/**
 * Composant d'administration pour la maintenance des embeddings Pinecone
 * 
 * Permet de:
 * - Indexer de nouveaux documents
 * - Réindexer tous les documents
 * - Visualiser les logs d'indexation
 * - Vérifier la configuration Pinecone
 */
const EmbeddingMaintenance = () => {
  const { 
    isUpdating, 
    progress, 
    logs, 
    errorSummary,
    updateDocumentEmbeddings, 
    clearLogs,
    exportLogs,
    retryLastOperation
  } = useEmbeddingsUpdate();

  const [configInfo, setConfigInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("indexation");
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Format progress as an integer
  const displayProgress = Math.round(progress);

  // Handler pour indexation standard
  const handleStandardUpdate = () => {
    updateDocumentEmbeddings(false);
  };

  // Handler pour indexation forcée
  const handleForceUpdate = () => {
    updateDocumentEmbeddings(true);
  };

  // Récupération de la configuration Pinecone - exécutée au montage et lors du changement d'onglet
  useEffect(() => {
    if (activeTab === "config") {
      fetchPineconeConfig();
    }
  }, [activeTab]);

  // Récupération de la configuration Pinecone
  const fetchPineconeConfig = async () => {
    setIsLoading(true);
    setFetchError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { action: 'config' }
      });
      
      if (error) {
        console.error("Erreur lors de la récupération de la configuration:", error);
        setFetchError(`Erreur: ${error.message || "Impossible de contacter la fonction edge"}`);
        setConfigInfo(null);
      } else {
        console.log("Configuration Pinecone récupérée:", data);
        setConfigInfo(data);
      }
    } catch (err) {
      console.error("Exception lors de la récupération de la configuration:", err);
      setFetchError(`Exception: ${err instanceof Error ? err.message : String(err)}`);
      setConfigInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Indexation Pinecone
        </CardTitle>
        <CardDescription>
          Indexez vos documents dans Pinecone pour la recherche sémantique
        </CardDescription>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList>
            <TabsTrigger value="indexation">
              <Database className="h-4 w-4 mr-2" />
              Indexation
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {activeTab === "indexation" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                className="flex items-center justify-center gap-2 h-auto py-6"
                onClick={handleStandardUpdate}
                disabled={isUpdating}
              >
                <div className="flex items-center">
                  <Database className="h-5 w-5 mr-2 text-blue-500" />
                  <div className="text-left">
                    <div className="font-semibold">Indexer nouveaux documents</div>
                    <div className="text-xs text-muted-foreground">Mettre à jour les documents non indexés</div>
                  </div>
                </div>
              </Button>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      className="flex items-center justify-center gap-2 h-auto py-6"
                      onClick={handleForceUpdate}
                      disabled={isUpdating}
                      variant="outline"
                    >
                      <div className="flex items-center">
                        <Repeat className="h-5 w-5 mr-2 text-orange-500" />
                        <div className="text-left">
                          <div className="font-semibold">Réindexer TOUS les documents</div>
                          <div className="text-xs text-muted-foreground">Forcer la réindexation même des documents déjà indexés</div>
                        </div>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">Cette option force la réindexation de tous les documents, même ceux déjà indexés. Utile en cas de changement de configuration Pinecone.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {isUpdating && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Progression: {displayProgress}%</p>
                <Progress value={displayProgress} className="h-2" />
              </div>
            )}
            
            {errorSummary && (
              <ErrorAlert 
                errorSummary={errorSummary}
                onRetry={retryLastOperation}
              />
            )}
            
            <div className="relative">
              <ScrollArea className="h-48 border rounded-md p-2">
                <div className="space-y-1">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <p key={index} className="text-xs font-mono">
                        {log}
                      </p>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-muted-foreground">
                      <p className="text-sm">Aucun log disponible</p>
                      <p className="text-xs mt-1">Lancez une indexation pour générer des logs</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {logs.length > 0 && (
                <div className="absolute bottom-2 right-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 rounded-full"
                          onClick={exportLogs}
                        >
                          <Download className="h-3 w-3" />
                          <span className="sr-only">Exporter les logs</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Exporter les logs</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
            
            {!isUpdating && logs.length > 0 && !errorSummary && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Opération terminée</AlertTitle>
                <AlertDescription>
                  L'indexation des documents est terminée.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        {activeTab === "config" && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-sm text-muted-foreground">Chargement de la configuration...</p>
              </div>
            ) : fetchError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur de chargement</AlertTitle>
                <AlertDescription>
                  <p>{fetchError}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchPineconeConfig}
                    className="mt-2"
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Réessayer
                  </Button>
                </AlertDescription>
              </Alert>
            ) : configInfo ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Server className="h-4 w-4 text-primary" />
                      Configuration Pinecone
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Clé API:</span>
                        <Badge variant={configInfo.config?.hasPineconeKey ? "success" : "destructive"}>
                          {configInfo.config?.hasPineconeKey ? "Configurée" : "Manquante"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">URL:</span>
                        <Badge variant={configInfo.config?.hasPineconeUrl ? "success" : "destructive"}>
                          {configInfo.config?.pineconeUrlStatus || "Non configurée"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Index:</span>
                        <Badge variant={configInfo.config?.hasPineconeIndex ? "success" : "default"}>
                          {configInfo.config?.effectiveIndex || "Par défaut"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">URL Alternative:</span>
                        <Badge variant={configInfo.config?.hasAlternativeUrl ? "success" : "outline"}>
                          {configInfo.config?.hasAlternativeUrl ? "Configurée" : "Non configurée"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4 text-primary" />
                      Détails
                    </h3>
                    <div className="space-y-2">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">URL effective:</span>
                        <span className="text-xs font-mono truncate" title={configInfo.config?.effectiveUrl}>
                          {configInfo.config?.effectiveUrl}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Index effectif:</span>
                        <span className="text-xs font-mono">
                          {configInfo.config?.effectiveIndex}
                          {configInfo.config?.isUsingDefaultIndex && " (par défaut)"}
                        </span>
                      </div>
                      <div className="flex flex-col mt-2">
                        <span className="text-xs text-muted-foreground">Dernière vérification:</span>
                        <span className="text-xs font-mono">
                          {configInfo.timestamp ? new Date(configInfo.timestamp).toLocaleString() : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {!configInfo.valid && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Configuration incomplète</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                        {configInfo.warnings?.map((warning: string, index: number) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchPineconeConfig}
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Actualiser la configuration
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40">
                <p className="text-sm text-muted-foreground">Aucune information de configuration disponible</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchPineconeConfig}
                  className="mt-2"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Vérifier la configuration
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-1">
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            L'indexation via Pinecone permet d'améliorer la recherche sémantique
          </p>
        </div>
        {activeTab === "indexation" && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearLogs}
            disabled={logs.length === 0}
          >
            Effacer les logs
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EmbeddingMaintenance;
