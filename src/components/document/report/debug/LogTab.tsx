
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";

interface LogsTabProps {
  logs: string[];
  onClearLogs: () => void;
  onExportLogs: () => void;
}

const LogsTab: React.FC<LogsTabProps> = ({ logs, onClearLogs, onExportLogs }) => {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-2 text-muted-foreground">
        <p>Aucun log disponible</p>
        <p className="text-xs">Les logs apparaîtront ici pendant l'indexation ou les tests</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <ScrollArea className="h-[400px] w-full border rounded-md p-2">
        <pre className="font-mono text-xs whitespace-pre-wrap">
          {logs.join('\n')}
        </pre>
      </ScrollArea>
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onClearLogs}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" />
          Effacer
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onExportLogs}
          className="flex items-center gap-1"
        >
          <Download className="h-3 w-3" />
          Exporter
        </Button>
      </div>
    </div>
  );
};

export default LogsTab;
