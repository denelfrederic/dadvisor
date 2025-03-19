
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check, Download, Database } from "lucide-react";

interface HeaderSectionProps {
  onUpdateDocuments: () => void;
  onClearLogs: () => void;
  onExportLogs: () => void;
  isUpdating: boolean;
  hasLogs: boolean;
}

/**
 * En-tête du rapport de document avec les actions principales
 */
const HeaderSection: React.FC<HeaderSectionProps> = ({ 
  onUpdateDocuments, 
  onClearLogs, 
  onExportLogs, 
  isUpdating,
  hasLogs
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-medium">Indexation Pinecone</h2>
      <div className="flex gap-2">
        <Button 
          onClick={onUpdateDocuments} 
          disabled={isUpdating}
          className="flex items-center gap-2"
        >
          {isUpdating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Indexation en cours...
            </>
          ) : (
            <>
              <Database className="h-4 w-4" />
              Vectoriser tous les documents
            </>
          )}
        </Button>
        <Button 
          onClick={onClearLogs} 
          variant="outline"
          disabled={!hasLogs}
        >
          Effacer les logs
        </Button>
        {hasLogs && (
          <Button
            onClick={onExportLogs}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter les logs
          </Button>
        )}
      </div>
    </div>
  );
};

export default HeaderSection;
