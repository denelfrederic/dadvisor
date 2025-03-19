
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogsTabProps {
  detailedLogs: string[];
}

const LogsTab: React.FC<LogsTabProps> = ({ detailedLogs }) => {
  return (
    <ScrollArea className="h-[200px] border rounded-md p-2 bg-black/90 text-white font-mono">
      {detailedLogs.length > 0 ? (
        <div className="space-y-1 text-xs">
          {detailedLogs.map((log, index) => (
            <div key={index} className="whitespace-pre-wrap">{log}</div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-20 text-center p-4 text-gray-400">
          <p className="text-sm">Aucun log disponible. Exécutez une action pour générer des logs.</p>
        </div>
      )}
    </ScrollArea>
  );
};

export default LogsTab;
