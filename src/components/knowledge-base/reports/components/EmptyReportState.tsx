
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface EmptyReportStateProps {
  isLoading: boolean;
  onGenerateReport: () => void;
}

const EmptyReportState = ({ isLoading, onGenerateReport }: EmptyReportStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-80 text-center">
      <RefreshCw className="h-12 w-12 mb-4 text-muted-foreground/60" />
      <h3 className="text-lg font-medium mb-2">Aucun rapport disponible</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Générez un rapport pour analyser l'état d'indexation de vos données et optimiser 
        les performances de recherche de votre assistant IA.
      </p>
      <Button onClick={onGenerateReport} disabled={isLoading} className="px-6">
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Générer le rapport
      </Button>
    </div>
  );
};

export default EmptyReportState;
