
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText } from "lucide-react";

interface ReportHeaderProps {
  isLoading: boolean;
  onGenerateReport: () => void;
}

const ReportHeader = ({ isLoading, onGenerateReport }: ReportHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        Rapport d'indexation global
      </h2>
      <Button 
        onClick={onGenerateReport} 
        disabled={isLoading}
        className="px-4"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Analyse en cours...' : 'Générer le rapport'}
      </Button>
    </div>
  );
};

export default ReportHeader;
