
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileWarning } from "lucide-react";

interface EmptyReportStateProps {
  onGenerateReport: () => void;
  isLoading: boolean;
  error: string | null;
}

const EmptyReportState = ({ onGenerateReport, isLoading, error }: EmptyReportStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-80 text-center">
      <FileWarning className="h-12 w-12 mb-4 text-muted-foreground/60" />
      <h3 className="text-lg font-medium mb-2">Aucun rapport disponible</h3>
      <p className="text-muted-foreground mb-4">
        Générez un rapport pour voir l'état d'indexation de vos documents
      </p>
      <Button onClick={onGenerateReport} disabled={isLoading}>
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Générer le rapport
      </Button>
      
      {error && (
        <p className="mt-4 text-red-500 text-sm">
          Erreur: {error}
        </p>
      )}
    </div>
  );
};

export default EmptyReportState;
