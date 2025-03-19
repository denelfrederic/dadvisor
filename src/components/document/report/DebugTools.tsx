
import React from "react";
import { Button } from "@/components/ui/button";
import { setupDocumentReportingDebug } from "./utils/reportDebugUtils";
import { IndexationReport } from "../hooks/useIndexationReport";

interface DebugToolsProps {
  report: IndexationReport | null;
}

const DebugTools: React.FC<DebugToolsProps> = ({ report }) => {
  return (
    <div className="text-xs text-gray-400 mt-2">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => {
          console.log("Tests manuels disponibles dans la console:");
          console.log("- Ouvrez la console et tapez: await window.testDocumentReporting.testReportGeneration()");
          console.log("- Pour vérifier le rapport UI vs base de données: await window.testDocumentReporting.verifyReportAccuracy()");
          
          if (typeof window !== 'undefined') {
            (window as any).testDocumentReporting = setupDocumentReportingDebug(report);
          }
        }}
      >
        Activer outils de diagnostic
      </Button>
    </div>
  );
};

export default DebugTools;
