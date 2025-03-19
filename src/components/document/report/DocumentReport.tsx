
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check, AlertTriangle, Download, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEmbeddingsUpdate } from "../../knowledge-base/search/hooks/useEmbeddingsUpdate";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SystemLogs from "./SystemLogs";

const DocumentReport: React.FC = () => {
  const { 
    updateDocumentEmbeddings, 
    isUpdating, 
    logs, 
    clearLogs, 
    exportLogs,
    errorSummary,
    progress
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
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur d'indexation</AlertTitle>
          <AlertDescription className="text-sm whitespace-pre-wrap">
            {errorSummary}
            
            {errorSummary.includes("API") && (
              <div className="mt-2 text-xs">
                <p><strong>Solutions possibles :</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  {errorSummary.includes("OpenAI") && (
                    <li>Vérifiez que la clé API OpenAI est correctement configurée dans les secrets Supabase.</li>
                  )}
                  {errorSummary.includes("Pinecone") && (
                    <li>Vérifiez que la clé API Pinecone est correctement configurée dans les secrets Supabase.</li>
                  )}
                  <li>Vérifiez les paramètres d'index Pinecone (environment, index name).</li>
                  <li>Consultez les logs ci-dessous pour plus de détails.</li>
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {progress > 0 && progress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 my-4">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      <SystemLogs 
        logs={logs}
        onExport={exportLogs}
        onClear={clearLogs}
      />
    </div>
  );
};

export default DocumentReport;
