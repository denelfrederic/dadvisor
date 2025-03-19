
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEmbeddingsUpdate } from "../search/hooks/useEmbeddingsUpdate";
import { Database, RefreshCcw, AlertCircle, Info, Download, Repeat } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
      </CardHeader>
      
      <CardContent className="space-y-4">
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
        </div>
        
        {isUpdating && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Progression: {displayProgress}%</p>
            <Progress value={displayProgress} className="h-2" />
          </div>
        )}
        
        {errorSummary && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur détectée</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{errorSummary}</p>
              
              {/* Bouton de solution alternative */}
              <Button
                variant="outline"
                size="sm"
                onClick={retryLastOperation}
                className="mt-2"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Réessayer avec configuration alternative
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <ScrollArea className="h-48 border rounded-md p-2">
          <div className="space-y-1">
            {logs.map((log, index) => (
              <p key={index} className="text-xs font-mono">
                {log}
              </p>
            ))}
          </div>
        </ScrollArea>
        
        {!isUpdating && logs.length > 0 && !errorSummary && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Opération terminée</AlertTitle>
            <AlertDescription>
              L'indexation des documents est terminée.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          L'indexation via Pinecone permet d'améliorer la recherche sémantique
        </p>
        <div className="flex gap-2">
          {logs.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportLogs}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter les logs
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearLogs}
            disabled={logs.length === 0}
          >
            Effacer les logs
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EmbeddingMaintenance;
