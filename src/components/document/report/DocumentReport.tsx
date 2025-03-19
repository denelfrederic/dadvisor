
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEmbeddingsUpdate } from "../../knowledge-base/search/hooks/useEmbeddingsUpdate";
import { Card } from "@/components/ui/card";

const DocumentReport: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const { updateDocumentEmbeddings, isUpdating } = useEmbeddingsUpdate();
  
  // Fonction pour ajouter des logs
  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev]);
  };
  
  // Vectoriser tous les documents
  const handleVectorizeAll = async () => {
    addLog("Démarrage de l'indexation de tous les documents...");
    
    // Utiliser la fonction de mise à jour avec notre fonction de logs
    await updateDocumentEmbeddings();
    
    addLog("Opération terminée.");
  };
  
  // Effacer les logs
  const clearLogs = () => {
    setLogs([]);
    addLog("Logs effacés");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Indexation Pinecone</h2>
        <div className="flex gap-2">
          <Button 
            onClick={handleVectorizeAll} 
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
        </div>
      </div>

      <Card className="p-4">
        <h3 className="font-medium mb-2">Logs d'indexation</h3>
        <ScrollArea className="h-[400px] border rounded-md p-2 bg-black/90 text-white font-mono">
          {logs.length > 0 ? (
            <div className="space-y-1 text-xs">
              {logs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap">
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
