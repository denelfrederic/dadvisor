
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wrench, CheckCircle, XCircle } from "lucide-react";

interface DebugActionsProps {
  onGetConfig: () => void;
  onTestConnection: () => void;
  onClearLogs: () => void;
  pineconeStatus: 'idle' | 'loading' | 'success' | 'error';
  connectionTest: any;
  hasLogs: boolean;
}

const DebugActions: React.FC<DebugActionsProps> = ({ 
  onGetConfig, 
  onTestConnection, 
  onClearLogs, 
  pineconeStatus, 
  connectionTest,
  hasLogs
}) => {
  return (
    <div className="flex gap-2">
      <Button 
        onClick={onGetConfig} 
        variant="outline" 
        size="sm"
        disabled={pineconeStatus === 'loading'}
      >
        {pineconeStatus === 'loading' ? (
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Wrench className="h-4 w-4 mr-2" />
        )}
        Vérifier config
      </Button>
      
      <Button
        onClick={onTestConnection}
        variant="outline"
        size="sm"
        disabled={pineconeStatus === 'loading'}
      >
        {connectionTest?.success ? (
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
        ) : connectionTest ? (
          <XCircle className="h-4 w-4 mr-2 text-red-500" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-2" />
        )}
        Tester connexion
      </Button>
      
      <Button
        onClick={onClearLogs}
        variant="outline"
        size="sm"
        disabled={!hasLogs}
      >
        Effacer logs
      </Button>
    </div>
  );
};

export default DebugActions;
