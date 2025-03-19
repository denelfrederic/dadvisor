
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, AlertTriangle, Check, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatFileSize } from "./utils";
import { generateEmbedding } from "../chat/services/document/embeddingService";
import { analyzeDocumentEmbeddingIssue } from "./report/utils/documentEmbeddingAnalyzer";

interface DocumentDetailDialogProps {
  documentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentDetailDialog = ({ documentId, isOpen, onClose }: DocumentDetailDialogProps) => {
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [analysis, setAnalysis] = useState<any>(null);
  const [updatingEmbedding, setUpdatingEmbedding] = useState(false);
  const [updateResult, setUpdateResult] = useState<{success: boolean; message: string} | null>(null);

  useEffect(() => {
    if (isOpen && documentId) {
      loadDocument();
      analyzeDocument();
    } else {
      setDocument(null);
      setAnalysis(null);
      setUpdateResult(null);
    }
  }, [isOpen, documentId]);

  const loadDocument = async () => {
    if (!documentId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();
      
      if (error) throw error;
      setDocument(data);
    } catch (error) {
      console.error("Erreur lors du chargement du document:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeDocument = async () => {
    if (!documentId) return;
    
    try {
      const result = await analyzeDocumentEmbeddingIssue(documentId);
      setAnalysis(result);
    } catch (error) {
      console.error("Erreur lors de l'analyse du document:", error);
    }
  };

  const updateEmbedding = async () => {
    if (!document || !document.content) return;
    
    setUpdatingEmbedding(true);
    setUpdateResult(null);
    
    try {
      // Générer un embedding
      const embedding = await generateEmbedding(document.content, "document");
      
      // Vérifier si l'embedding a été généré
      if (!embedding) {
        throw new Error("Échec de génération de l'embedding");
      }
      
      // Convertir l'embedding au format de stockage
      const embeddingForStorage = 
        typeof embedding === 'string' ? embedding : JSON.stringify(embedding);
      
      // Mettre à jour le document
      const { error } = await supabase
        .from('documents')
        .update({ embedding: embeddingForStorage })
        .eq('id', document.id);
      
      if (error) throw error;
      
      // Recharger le document
      loadDocument();
      
      setUpdateResult({
        success: true,
        message: "Embedding généré et enregistré avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'embedding:", error);
      setUpdateResult({
        success: false,
        message: `Erreur: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setUpdatingEmbedding(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="py-8 text-center">Chargement du document...</div>;
    }
    
    if (!document) {
      return <div className="py-8 text-center">Document non trouvé</div>;
    }
    
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="embedding">Statut Embedding</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Titre</h3>
              <p>{document.title}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
              <p>{document.type}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Taille</h3>
              <p>{formatFileSize(document.size)}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Date d'ajout</h3>
              <p>{new Date(document.created_at).toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Source</h3>
              <p>{document.source || "Non spécifiée"}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Embedding</h3>
              <p className="flex items-center">
                {document.embedding ? (
                  <><Check className="h-4 w-4 text-green-500 mr-2" /> Disponible</>
                ) : (
                  <><AlertTriangle className="h-4 w-4 text-amber-500 mr-2" /> Non disponible</>
                )}
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="content">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Contenu ({document.content?.length || 0} caractères)
            </h3>
            <div className="p-3 bg-muted rounded-md text-sm max-h-96 overflow-y-auto whitespace-pre-wrap">
              {document.content || "Pas de contenu disponible"}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="embedding" className="space-y-4">
          {document.embedding ? (
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
          ) : (
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
              
              <Button 
                onClick={updateEmbedding} 
                disabled={updatingEmbedding || !document.content}
                className="w-full"
              >
                {updatingEmbedding ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Générer l'embedding
                  </>
                )}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Détails du document
          </DialogTitle>
        </DialogHeader>
        
        {renderContent()}
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentDetailDialog;
