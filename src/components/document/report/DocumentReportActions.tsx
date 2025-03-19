
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, FilePlus } from "lucide-react";

interface DocumentReportActionsProps {
  onRefresh?: () => void;
  onExport?: () => void;
  onUpdateEmbeddings?: () => void;
  isLoading?: boolean;
  isUpdatingEmbeddings?: boolean;
  showExport?: boolean;
  showUpdateEmbeddings?: boolean;
}

const DocumentReportActions: React.FC<DocumentReportActionsProps> = ({ 
  onRefresh, 
  onExport,
  onUpdateEmbeddings,
  isLoading = false,
  isUpdatingEmbeddings = false,
  showExport = false,
  showUpdateEmbeddings = false
}) => {
  return (
    <div className="flex gap-2">
      {onRefresh && (
        <Button 
          onClick={onRefresh} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Analyse...' : 'Actualiser le rapport'}
        </Button>
      )}
      
      {showExport && onExport && (
        <Button 
          onClick={onExport} 
          variant="outline"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      )}
      
      {showUpdateEmbeddings && onUpdateEmbeddings && (
        <Button
          onClick={onUpdateEmbeddings}
          disabled={isUpdatingEmbeddings || isLoading}
          variant="outline"
          size="sm"
        >
          <FilePlus className="h-4 w-4 mr-2" />
          {isUpdatingEmbeddings ? 'Génération...' : 'Générer embeddings manquants'}
        </Button>
      )}
    </div>
  );
};

export default DocumentReportActions;
