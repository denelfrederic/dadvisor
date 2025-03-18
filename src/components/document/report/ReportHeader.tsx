
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, FilePlus } from "lucide-react";

interface ReportHeaderProps {
  onGenerateReport: () => void;
  onUpdateEmbeddings: () => void;
  isLoading: boolean;
  isUpdatingEmbeddings: boolean;
  reportExists: boolean;
}

const ReportHeader = ({
  onGenerateReport,
  onUpdateEmbeddings,
  isLoading,
  isUpdatingEmbeddings,
  reportExists
}: ReportHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Rapport d'indexation des documents</h2>
      <div className="flex gap-2">
        <Button 
          onClick={onGenerateReport} 
          disabled={isLoading}
          variant="outline" 
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Analyse...' : 'Générer le rapport'}
        </Button>
        
        <Button
          onClick={onUpdateEmbeddings}
          disabled={isUpdatingEmbeddings || isLoading || !reportExists}
          variant="outline"
          size="sm"
        >
          <FilePlus className="h-4 w-4 mr-2" />
          {isUpdatingEmbeddings ? 'Génération...' : 'Générer embeddings manquants'}
        </Button>
      </div>
    </div>
  );
};

export default ReportHeader;
