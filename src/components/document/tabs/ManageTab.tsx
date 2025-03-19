
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DocumentStats from "../DocumentStats";
import DocumentTypesList from "../DocumentTypesList";
import DocumentTable from "../report/DocumentTable";
import DocumentDetailDialog from "../DocumentDetailDialog";
import { clearDocumentDatabase, exportDocuments } from "../../chat/services/document/documentManagement";
import { supabase } from "@/integrations/supabase/client";
import { DocumentIndexationStatus } from "../hooks/useIndexationReport";

interface ManageTabProps {
  stats: {
    count: number;
    types: Record<string, number>;
    totalSize: number;
  };
  refreshStats: () => Promise<void>;
}

const ManageTab = ({ stats, refreshStats }: ManageTabProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [documents, setDocuments] = useState<DocumentIndexationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  // Charger la liste des documents
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Transformer les données pour correspondre au format DocumentIndexationStatus
        const formattedData = data.map(doc => ({
          id: doc.id,
          title: doc.title || 'Sans titre',
          type: doc.type || 'Inconnu',
          size: doc.size || 0,
          created_at: doc.created_at,
          hasEmbedding: !!doc.embedding,
          pineconeIndexed: doc.pinecone_indexed === true,
          status: doc.pinecone_indexed ? 'Indexé' : 'Non indexé'
        }));
        
        setDocuments(formattedData);
      } catch (error) {
        console.error("Erreur lors du chargement des documents:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger la liste des documents."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [toast]);

  const handleClearDatabase = async () => {
    if (confirm("Voulez-vous vraiment supprimer tous les documents de la base locale ?")) {
      await clearDocumentDatabase();
      await refreshStats();
      setDocuments([]);
      toast({
        title: "Base de données vidée",
        description: "Tous les documents ont été supprimés de la base locale."
      });
    }
  };

  const handleExportDatabase = async () => {
    try {
      setIsExporting(true);
      const documents = await exportDocuments();
      
      if (!documents || documents.length === 0) {
        toast({
          variant: "destructive",
          title: "Export échoué",
          description: "Aucun document trouvé dans la base de données."
        });
        return;
      }
      
      const jsonData = JSON.stringify(documents, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `dadvisor-docs-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Export réussi",
        description: `${documents.length} documents exportés en format JSON.`
      });
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      toast({
        variant: "destructive",
        title: "Export échoué",
        description: "Une erreur s'est produite lors de l'export des documents."
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewDetails = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
    setSelectedDocumentId(null);
  };

  return (
    <div className="space-y-4">
      <DocumentStats stats={stats} />

      {stats.count > 0 && <DocumentTypesList types={stats.types} />}
      
      {/* Liste des documents avec la possibilité de voir les détails */}
      {stats.count > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Liste des documents</h3>
          <DocumentTable 
            documents={documents} 
            onViewDetails={handleViewDetails}
          />
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button 
          variant="outline" 
          onClick={handleExportDatabase} 
          disabled={stats.count === 0 || isExporting}
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Export...' : 'Exporter'}
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleClearDatabase}
          disabled={stats.count === 0}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Vider la base
        </Button>
      </div>
      
      {/* Boîte de dialogue des détails du document */}
      <DocumentDetailDialog
        documentId={selectedDocumentId}
        isOpen={isDetailDialogOpen}
        onClose={handleCloseDetailDialog}
      />
    </div>
  );
};

export default ManageTab;
