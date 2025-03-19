
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check, AlertTriangle, Download } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEmbeddingsUpdate } from "../../knowledge-base/search/hooks/useEmbeddingsUpdate";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DocumentReport: React.FC = () => {
  const { 
    updateDocumentEmbeddings, 
    isUpdating, 
    logs, 
    clearLogs, 
    exportLogs,
    errorSummary
  } = useEmbeddingsUpdate();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Indexation Pinecone</h2>
        <div className="flex gap-2">
          <Button 
            onClick={updateDocumentEmbeddings} 
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Indexation en cours...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Vectoriser tous les documents
              </>
            )}
          </Button>
          <Button 
            onClick={clearLogs} 
            variant="outline"
            disabled={logs.length === 0}
          >
            Effacer les logs
          </Button>
          {logs.length > 0 && (
            <Button
              onClick={exportLogs}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter les logs
            </Button>
          )}
        </div>
      </div>
      
      {errorSummary && (
        <Alert variant="destructive" className="my-4">
          <AlertTitle>Erreur d'indexation</AlertTitle>
          <AlertDescription>
            {errorSummary}
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4">
        <h3 className="font-medium mb-2">Logs d'indexation</h3>
        <ScrollArea className="h-[400px] border rounded-md p-2 bg-black/90 text-white font-mono">
          {logs.length > 0 ? (
            <div className="space-y-1 text-xs">
              {logs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap py-1 border-b border-gray-800">
                  {log}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-center p-4 text-gray-400">
              <AlertTriangle className="h-5 w-5 mb-2" />
              <p>Aucun log disponible</p>
              <p className="text-xs mt-1">Cliquez sur "Vectoriser tous les documents" pour commencer l'indexation</p>
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
};

export default DocumentReport;
