
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, RefreshCw, Loader2, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentEmbeddingTabProps {
  document: any;
  analysis: any;
  updateResult: { success: boolean; message: string } | null;
  updatingEmbedding: boolean;
  onUpdateEmbedding: () => void;
  onFixEmbedding?: () => void;
  onReloadDocument: () => void;
  onSyncStatus?: () => void;
}

const DocumentEmbeddingTab = ({
  document,
  analysis,
  updateResult,
  updatingEmbedding,
  onUpdateEmbedding,
  onFixEmbedding,
  onReloadDocument,
  onSyncStatus,
}: DocumentEmbeddingTabProps) => {
  const { toast } = useToast();
  
  useEffect(() => {
    if (updateResult?.success) {
      toast({
        title: "Succès",
        description: updateResult.message,
      });
      
      // Recharger automatiquement le document après un succès
      onReloadDocument();
    } else if (updateResult && !updateResult.success) {
      toast({
        title: "Erreur",
        description: updateResult.message,
        variant: "destructive"
      });
    }
  }, [updateResult, toast, onReloadDocument]);

  if (!document) return null;

  const isPineconeIndexed = document.pinecone_indexed === true;
  const hasEmbedding = !!document.embedding;
  const needsSync = hasEmbedding && !isPineconeIndexed;

  if (isPineconeIndexed) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
          <Check className="h-5 w-5" />
          <span>Ce document est indexé dans Pinecone et peut être utilisé pour la recherche sémantique.</span>
        </div>
        
        <Button
          onClick={onReloadDocument}
          variant="outline"
          size="sm"
          className="mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Rafraîchir les informations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-md">
        <AlertTriangle className="h-5 w-5" />
        <span>Ce document n'est pas marqué comme indexé dans Pinecone et pourrait ne pas être utilisé pour la recherche sémantique.</span>
      </div>
      
      {analysis && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Analyse</h3>
          <div className="p-3 bg-muted rounded-md whitespace-pre-line">
            <p>{analysis.analysis}</p>
          </div>
        </div>
      )}
      
      {updateResult && (
        <div className={`p-3 rounded-md ${updateResult.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          <p>{updateResult.message}</p>
          {updateResult.success && (
            <Button
              onClick={onReloadDocument}
              variant="link"
              size="sm"
              className="p-0 h-auto text-green-600 mt-2"
            >
              Cliquez ici pour rafraîchir les données du document
            </Button>
          )}
        </div>
      )}
      
      {/* Bouton de synchronisation si le document a un embedding mais n'est pas marqué comme indexé */}
      {needsSync && onSyncStatus && (
        <Button 
          onClick={onSyncStatus}
          variant="outline" 
          className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Synchroniser le statut Pinecone
        </Button>
      )}
      
      {/* Bouton principal d'indexation */}
      <Button 
        onClick={onUpdateEmbedding} 
        disabled={updatingEmbedding || !document.content}
        className="w-full"
      >
        {updatingEmbedding ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Indexation en cours...
          </>
        ) : (
          <>
            <Database className="h-4 w-4 mr-2" />
            Indexer dans Pinecone
          </>
        )}
      </Button>

      {/* Bouton de solution alternative */}
      {onFixEmbedding && updateResult && !updateResult.success && (
        <Button 
          onClick={onFixEmbedding}
          variant="outline"
          size="sm"
          className="w-full mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer l'indexation
        </Button>
      )}

      {updateResult && !updateResult.success && (
        <Button 
          onClick={onReloadDocument}
          variant="outline"
          size="sm"
          className="w-full mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Rafraîchir les données du document
        </Button>
      )}
    </div>
  );
}

export default DocumentEmbeddingTab;
