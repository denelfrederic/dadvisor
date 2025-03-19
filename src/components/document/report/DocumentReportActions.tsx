
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Brain, Database } from "lucide-react";
import { Link } from "react-router-dom";

interface DocumentReportActionsProps {
  onRefresh: () => void;
  onUpdateEmbeddings?: () => void;
  isLoading: boolean;
  isUpdatingEmbeddings?: boolean;
  showUpdateEmbeddings?: boolean;
}

const DocumentReportActions = ({
  onRefresh,
  onUpdateEmbeddings,
  isLoading,
  isUpdatingEmbeddings,
  showUpdateEmbeddings = false,
}: DocumentReportActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      {showUpdateEmbeddings && onUpdateEmbeddings && (
        <Button
          variant="outline"
          size="sm"
          onClick={onUpdateEmbeddings}
          disabled={isUpdatingEmbeddings}
        >
          {isUpdatingEmbeddings ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Générer Embeddings
            </>
          )}
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Actualisation...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </>
        )}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        asChild
      >
        <Link to="/documents/indexed">
          <Database className="h-4 w-4 mr-2" />
          Voir documents indexés
        </Link>
      </Button>
    </div>
  );
};

export default DocumentReportActions;
