
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Database, Code } from "lucide-react";
import { useDocumentDetail } from "./detail/useDocumentDetail";
import DocumentInfoTab from "./detail/DocumentInfoTab";
import DocumentContentTab from "./detail/DocumentContentTab";
import DocumentEmbeddingTab from "./detail/DocumentEmbeddingTab";

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
    reloadDocument,
    syncPineconeStatus
  } = useDocumentDetail(documentId, isOpen);

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chargement du document...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (!document) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document introuvable</DialogTitle>
          </DialogHeader>
          <p>Le document demandé n'existe pas ou a été supprimé.</p>
          <DialogFooter>
            <Button onClick={onClose}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{document.title}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="info">
              <FileText className="h-4 w-4 mr-2" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="content">
              <Code className="h-4 w-4 mr-2" />
              Contenu
            </TabsTrigger>
            <TabsTrigger value="embedding">
              <Database className="h-4 w-4 mr-2" />
              Statut Embedding
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <DocumentInfoTab document={document} />
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <DocumentContentTab document={document} />
          </TabsContent>

          <TabsContent value="embedding" className="space-y-4">
            <DocumentEmbeddingTab
              document={document}
              analysis={analysis}
              updateResult={updateResult}
              updatingEmbedding={updatingEmbedding}
              onUpdateEmbedding={updateEmbedding}
              onReloadDocument={reloadDocument}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentDetailDialog;
