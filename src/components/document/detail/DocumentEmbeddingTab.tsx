
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, RefreshCw, FileText, FileCode, Loader2, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DocumentEmbeddingTabProps {
  document: any;
  analysis: any;
  updateResult: { success: boolean; message: string } | null;
  updatingEmbedding: boolean;
  onUpdateEmbedding: () => void;
  onFixEmbedding: () => void;
  onReloadDocument: () => void;
}

const DocumentEmbeddingTab = ({
  document,
  analysis,
  updateResult,
  updatingEmbedding,
  onUpdateEmbedding,
  onFixEmbedding,
  onReloadDocument,
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

  const hasVectorization = document.embedding || document.pinecone_indexed === true;

  if (hasVectorization) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
          <Check className="h-5 w-5" />
          <span>Ce document est vectorisé et peut être utilisé pour la recherche sémantique.</span>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Détails de la vectorisation</h3>
          <div className="p-3 bg-muted rounded-md text-xs">
            {document.pinecone_indexed === true ? (
              <p className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Document indexé dans Pinecone
              </p>
            ) : (
              <>
                <p>Type: {typeof document.embedding}</p>
                <p>Taille: {document.embedding?.length || 0} caractères</p>
              </>
            )}
          </div>
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
        <span>Ce document n'est pas vectorisé et ne peut pas être utilisé pour la recherche sémantique.</span>
      </div>
      
      {analysis && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Analyse du problème</h3>
          <div className="p-3 bg-muted rounded-md">
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
      
      <div className="grid grid-cols-2 gap-3">
        <Button 
          onClick={onUpdateEmbedding} 
          disabled={updatingEmbedding || !document.content}
          variant="outline"
        >
          {updatingEmbedding ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Vectorisation en cours...
            </>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              Vectoriser avec Pinecone
            </>
          )}
        </Button>
        
        <Button 
          onClick={onFixEmbedding} 
          disabled={updatingEmbedding || !document.content}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {updatingEmbedding ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Vectorisation optimisée...
            </>
          ) : (
            <>
              <FileCode className="h-4 w-4 mr-2" />
              Contenu tronqué + Pinecone
            </>
          )}
        </Button>
      </div>

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
};

export default DocumentEmbeddingTab;
