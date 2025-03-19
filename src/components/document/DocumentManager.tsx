
import { useState, useEffect } from "react";
import { Database } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BarChart, Database as DatabaseIcon } from "lucide-react";
import { getDocumentStats } from "../chat/services/document/documentManagement";
import DocumentFooter from "./DocumentFooter";
import UploadTab from "./tabs/UploadTab";
import ReportTab from "./tabs/ReportTab";
import ManageTab from "./tabs/ManageTab";

interface DocumentManagerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

const DocumentManager = ({ isOpen, onClose, initialTab = "upload" }: DocumentManagerProps) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [stats, setStats] = useState({ count: 0, types: {}, totalSize: 0 });

  const refreshStats = async () => {
    const currentStats = await getDocumentStats();
    setStats(currentStats);
  };

  useEffect(() => {
    if (isOpen) {
      refreshStats();
    }
  }, [isOpen]);
  
  // Mettre à jour l'onglet actif si initialTab change
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleUploadComplete = () => {
    refreshStats();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestionnaire de Documents
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="upload">
              <FileText className="h-4 w-4 mr-2" />
              Ajouter des documents
            </TabsTrigger>
            <TabsTrigger value="report">
              <BarChart className="h-4 w-4 mr-2" />
              Rapport d'indexation
            </TabsTrigger>
            <TabsTrigger value="manage">
              <DatabaseIcon className="h-4 w-4 mr-2" />
              Gérer la base
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <UploadTab onUploadComplete={handleUploadComplete} />
          </TabsContent>

          <TabsContent value="report">
            <ReportTab />
          </TabsContent>

          <TabsContent value="manage">
            <ManageTab stats={stats} refreshStats={refreshStats} />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <DocumentFooter stats={stats} onClose={onClose} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentManager;
