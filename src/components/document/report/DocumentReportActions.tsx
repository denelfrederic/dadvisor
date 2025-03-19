
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DocumentReportActionsProps {
  onRefresh: () => void;
  isLoading: boolean;
}

const DocumentReportActions: React.FC<DocumentReportActionsProps> = ({ 
  onRefresh, 
  isLoading 
}) => {
  return (
    <Button 
      onClick={onRefresh} 
      disabled={isLoading}
      variant="outline"
      className="px-6"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Analyse...' : 'Actualiser le rapport'}
    </Button>
  );
};

export default DocumentReportActions;
