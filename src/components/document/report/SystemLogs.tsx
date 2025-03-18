
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Trash2 } from "lucide-react";

interface SystemLogsProps {
  logs: string[];
  onExport: () => void;
  onClear: () => void;
}

const SystemLogs = ({ logs, onExport, onClear }: SystemLogsProps) => {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Logs système</h3>
        <div className="flex gap-2">
          <Button onClick={onExport} variant="outline" size="sm" disabled={logs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={onClear} variant="outline" size="sm" disabled={logs.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" />
            Effacer
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[400px] border rounded-md p-2 bg-black/90 text-white font-mono">
        {logs.length > 0 ? (
          <div className="space-y-1 text-xs">
            {logs.map((log, i) => (
              <div key={i} className="whitespace-pre-wrap">
                {log}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 text-center p-4 text-gray-400">
            <p>Aucun log disponible</p>
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default SystemLogs;
