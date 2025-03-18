
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileText, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DocumentUploader from "./DocumentUploader";
import { clearDocumentDatabase, getDocumentStats } from "../chat/GeminiService";
import { formatFileSize } from "./utils";

interface DocumentManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocumentManager = ({ isOpen, onClose }: DocumentManagerProps) => {
  const [stats, setStats] = useState({ count: 0, types: {}, totalSize: 0 });
  const { toast } = useToast();

  const refreshStats = () => {
    const currentStats = getDocumentStats();
    setStats(currentStats);
  };

  useEffect(() => {
    if (isOpen) {
      refreshStats();
    }
  }, [isOpen]);

  const handleClearDatabase = () => {
    if (confirm("Voulez-vous vraiment supprimer tous les documents de la base locale ?")) {
      clearDocumentDatabase();
      refreshStats();
      toast({
        title: "Base de données vidée",
        description: "Tous les documents ont été supprimés de la base locale.",
      });
    }
  };

  const handleExportDatabase = () => {
    const dbData = localStorage.getItem('documentDatabase') || '[]';
    const blob = new Blob([dbData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `dadvisor-docs-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Export réussi",
      description: "Base de documents exportée en format JSON.",
    });
  };

  const handleUploadComplete = () => {
    refreshStats();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestionnaire de Documents
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="upload">
              <FileText className="h-4 w-4 mr-2" />
              Ajouter des documents
            </TabsTrigger>
            <TabsTrigger value="manage">
              <Database className="h-4 w-4 mr-2" />
              Gérer la base
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <DocumentUploader onUploadComplete={handleUploadComplete} />
            
            <div className="bg-muted p-3 rounded text-sm">
              <p className="font-medium">Conseils pour améliorer le RAG:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-muted-foreground">
                <li>Privilégiez les documents textuels au format TXT ou MD</li>
                <li>Les documents structurés (CSV, JSON) sont plus faciles à indexer</li>
                <li>Évitez les documents trop volumineux ou très formatés</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="manage">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-lg p-3 text-center">
                  <p className="text-muted-foreground text-sm">Documents</p>
                  <p className="text-2xl font-bold mt-1">{stats.count}</p>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <p className="text-muted-foreground text-sm">Types</p>
                  <p className="text-2xl font-bold mt-1">{Object.keys(stats.types).length}</p>
                </div>
                <div className="border rounded-lg p-3 text-center">
                  <p className="text-muted-foreground text-sm">Taille totale</p>
                  <p className="text-2xl font-bold mt-1">{formatFileSize(stats.totalSize)}</p>
                </div>
              </div>

              {stats.count > 0 && (
                <div className="border rounded-lg p-3">
                  <p className="font-medium mb-2">Types de documents:</p>
                  <div className="space-y-1">
                    {Object.entries(stats.types).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center text-sm">
                        <span>{type || "Inconnu"}</span>
                        <span className="text-muted-foreground">{count} fichier(s)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleExportDatabase} disabled={stats.count === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
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
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <div className="w-full flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {stats.count} document(s) • {formatFileSize(stats.totalSize)}
            </p>
            <Button onClick={onClose}>Fermer</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentManager;
