
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface LogsTabProps {
  logs: string[];
  onClearLogs: () => void;
  onExportLogs: () => void;
}

/**
 * Onglet d'affichage des logs du système
 */
const LogsTab: React.FC<LogsTabProps> = ({ logs, onClearLogs, onExportLogs }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Logs du système</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearLogs}
            disabled={logs.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Effacer
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExportLogs}
            disabled={logs.length === 0}
          >
            <Download className="h-4 w-4 mr-1" />
            Exporter
          </Button>
        </div>
      </div>
      
      {logs.length === 0 ? (
        <Alert>
          <AlertDescription>
            Aucun log à afficher. Les logs seront affichés ici lorsque des opérations seront effectuées.
          </AlertDescription>
        </Alert>
      ) : (
        <ScrollArea className="h-64 w-full border rounded-md p-2">
          <div className="space-y-1">
            {logs.map((log, index) => (
              <p key={index} className="text-xs font-mono whitespace-pre-wrap">
                {log}
              </p>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default LogsTab;
