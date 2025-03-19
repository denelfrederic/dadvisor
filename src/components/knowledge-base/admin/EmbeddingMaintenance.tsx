
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEmbeddingsUpdate } from "../search/hooks/useEmbeddingsUpdate";
import { Database, RefreshCcw, AlertCircle, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const EmbeddingMaintenance = () => {
  const { 
    isUpdating, 
    progress, 
    logs, 
    errorSummary,
    updateDocumentEmbeddings, 
    clearLogs
  } = useEmbeddingsUpdate();

  // Format progress as an integer
  const displayProgress = Math.round(progress);

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
        <Button 
          className="w-full flex items-center justify-center gap-2 h-auto py-6"
          onClick={updateDocumentEmbeddings}
          disabled={isUpdating}
        >
          <div className="flex items-center">
            <Database className="h-5 w-5 mr-2 text-blue-500" />
            <div className="text-left">
              <div className="font-semibold">Indexer tous les documents</div>
              <div className="text-xs text-muted-foreground">Mettre à jour les documents non indexés</div>
            </div>
          </div>
        </Button>
        
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
            <AlertDescription>
              {errorSummary}
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
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearLogs}
          disabled={logs.length === 0}
        >
          Effacer les logs
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmbeddingMaintenance;
