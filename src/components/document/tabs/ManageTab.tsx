
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DocumentStats from "../DocumentStats";
import DocumentTypesList from "../DocumentTypesList";
import { clearDocumentDatabase, exportDocuments } from "../../chat/services";

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
  const { toast } = useToast();

  const handleClearDatabase = async () => {
    if (confirm("Voulez-vous vraiment supprimer tous les documents de la base locale ?")) {
      await clearDocumentDatabase();
      await refreshStats();
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

  return (
    <div className="space-y-4">
      <DocumentStats stats={stats} />

      {stats.count > 0 && <DocumentTypesList types={stats.types} />}

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
    </div>
  );
};

export default ManageTab;
