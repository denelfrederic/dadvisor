
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEmbeddingsUpdate } from "../search/hooks/useEmbeddingsUpdate";
import { Database, BookOpen, Brain, RefreshCcw, AlertCircle, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const EmbeddingMaintenance = () => {
  const { 
    isUpdating, 
    progress, 
    logs, 
    errorSummary,
    updateDocumentEmbeddings, 
    updateKnowledgeEntryEmbeddings,
    updateAllEmbeddings
  } = useEmbeddingsUpdate();

  // Format progress as an integer
  const displayProgress = Math.round(progress);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Maintenance des embeddings
        </CardTitle>
        <CardDescription>
          Mettez à jour les embeddings manquants pour améliorer la recherche sémantique
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            className="flex items-center justify-between gap-2 h-auto py-6"
            onClick={updateDocumentEmbeddings}
            disabled={isUpdating}
            variant="outline"
          >
            <div className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-blue-500" />
              <div className="text-left">
                <div className="font-semibold">Documents</div>
                <div className="text-xs text-muted-foreground">Indexer les documents</div>
              </div>
            </div>
          </Button>
          
          <Button 
            className="flex items-center justify-between gap-2 h-auto py-6"
            onClick={updateKnowledgeEntryEmbeddings}
            disabled={isUpdating}
            variant="outline"
          >
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-amber-500" />
              <div className="text-left">
                <div className="font-semibold">Base de connaissances</div>
                <div className="text-xs text-muted-foreground">Indexer les entrées de connaissances</div>
              </div>
            </div>
          </Button>
          
          <Button 
            className="flex items-center justify-between gap-2 h-auto py-6"
            onClick={updateAllEmbeddings}
            disabled={isUpdating}
            variant="outline"
          >
            <div className="flex items-center">
              <RefreshCcw className="h-5 w-5 mr-2 text-green-500" />
              <div className="text-left">
                <div className="font-semibold">Tout mettre à jour</div>
                <div className="text-xs text-muted-foreground">Indexer tous les éléments</div>
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
            <AlertDescription>
              {errorSummary}
            </AlertDescription>
          </Alert>
        )}
        
        {logs.length > 0 && (
          <ScrollArea className="h-48 border rounded-md p-2">
            <div className="space-y-1">
              {logs.map((log, index) => (
                <p key={index} className="text-xs font-mono">
                  {log}
                </p>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {!isUpdating && logs.length > 0 && !errorSummary && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Opération terminée</AlertTitle>
            <AlertDescription>
              La mise à jour des embeddings est terminée. Consultez les logs pour plus de détails.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <p className="text-xs text-muted-foreground">
          L'indexation permet de générer des embeddings pour les documents et entrées de connaissances
          qui n'en possèdent pas encore, améliorant ainsi la recherche sémantique.
        </p>
      </CardFooter>
    </Card>
  );
};

export default EmbeddingMaintenance;
