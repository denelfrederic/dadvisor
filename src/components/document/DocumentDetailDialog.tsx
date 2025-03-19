
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
import DocumentInfoTab from "./detail/DocumentInfoTab";
import DocumentContentTab from "./detail/DocumentContentTab";
import DocumentEmbeddingTab from "./detail/DocumentEmbeddingTab";
import { useDocumentDetail } from "./detail/useDocumentDetail";

interface DocumentDetailDialogProps {
  documentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentDetailDialog = ({ documentId, isOpen, onClose }: DocumentDetailDialogProps) => {
  const {
    document,
    loading,
    activeTab,
    analysis,
    updatingEmbedding,
    updateResult,
    setActiveTab,
    updateEmbedding,
    fixEmbedding,
    reloadDocument
  } = useDocumentDetail(documentId, isOpen);

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
        
        <TabsContent value="info">
          <DocumentInfoTab document={document} />
        </TabsContent>
        
        <TabsContent value="content">
          <DocumentContentTab content={document.content} />
        </TabsContent>
        
        <TabsContent value="embedding">
          <DocumentEmbeddingTab
            document={document}
            analysis={analysis}
            updateResult={updateResult}
            updatingEmbedding={updatingEmbedding}
            onUpdateEmbedding={updateEmbedding}
            onFixEmbedding={fixEmbedding}
            onReloadDocument={reloadDocument}
          />
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
