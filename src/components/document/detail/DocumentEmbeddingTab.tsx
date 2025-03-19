
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, RefreshCw, FileText, FileCode } from "lucide-react";

interface DocumentEmbeddingTabProps {
  document: any;
  analysis: any;
  updateResult: { success: boolean; message: string } | null;
  updatingEmbedding: boolean;
  onUpdateEmbedding: () => void;
  onFixEmbedding: () => void;
}

const DocumentEmbeddingTab = ({
  document,
  analysis,
  updateResult,
  updatingEmbedding,
  onUpdateEmbedding,
  onFixEmbedding,
}: DocumentEmbeddingTabProps) => {
  if (!document) return null;

  if (document.embedding) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
          <Check className="h-5 w-5" />
          <span>Ce document possède un embedding qui permet la recherche sémantique.</span>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Détails de l'embedding</h3>
          <div className="p-3 bg-muted rounded-md text-xs">
            <p>Type: {typeof document.embedding}</p>
            <p>Taille: {document.embedding?.length || 0} caractères</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-md">
        <AlertTriangle className="h-5 w-5" />
        <span>Ce document n'a pas d'embedding et ne peut pas être utilisé pour la recherche sémantique.</span>
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
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Génération standard
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
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Génération optimisée...
            </>
          ) : (
            <>
              <FileCode className="h-4 w-4 mr-2" />
              Génération optimisée
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DocumentEmbeddingTab;
