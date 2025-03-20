
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";
import { exportLogsToFile } from "./utils/logUtils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogPanelProps {
  logs: string[];
  onClear: () => void;
}

/**
 * Composant qui affiche les logs système de l'indexation
 * @param logs Liste des logs à afficher
 * @param onClear Fonction pour effacer les logs
 */
const LogPanel: React.FC<LogPanelProps> = ({ logs, onClear }) => {
  const handleExport = () => {
    exportLogsToFile(logs);
  };

  return (
    <Card className="min-h-[400px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Logs système</span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              disabled={logs.length === 0}
              title="Exporter les logs"
            >
              <Download className="h-4 w-4 mr-1" />
              Exporter
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClear}
              disabled={logs.length === 0}
              title="Effacer les logs"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Effacer
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-[300px] w-full rounded border p-2 bg-muted/20">
          {logs.length > 0 ? (
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {logs.join('\n')}
            </pre>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Aucun log disponible
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground pt-0">
        {logs.length > 0 ? `${logs.length} entrées de log` : "Les logs apparaîtront ici pendant l'indexation"}
      </CardFooter>
    </Card>
  );
};

export default LogPanel;
