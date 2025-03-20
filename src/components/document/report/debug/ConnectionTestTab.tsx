
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConnectionAlert from "./ConnectionAlert";
import TestConnectionButton from "./TestConnectionButton";

interface ConnectionTestTabProps {
  connectionTest: any;
  onTestConnection: (result: any) => void;
  isLoading: boolean;
}

const ConnectionTestTab: React.FC<ConnectionTestTabProps> = ({ 
  connectionTest, 
  onTestConnection,
  isLoading
}) => {
  // Ouverture de la console Pinecone
  const openPineconeConsole = () => {
    window.open("https://app.pinecone.io", "_blank");
  };
  
  if (!connectionTest) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">Aucun test de connexion n'a été effectué</p>
        <TestConnectionButton 
          onTestComplete={onTestConnection}
          isLoading={isLoading}
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {connectionTest.success ? (
        <Alert variant="success" className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Connexion réussie</AlertTitle>
          <AlertDescription className="text-green-700">
            <p>La connexion à Pinecone a été établie avec succès.</p>
            {connectionTest.apiType && (
              <p className="mt-1 text-xs">
                <span className="font-medium">Type d'API détecté:</span> {connectionTest.apiType}
              </p>
            )}
            {connectionTest.indexName && (
              <p className="mt-1 text-xs">
                <span className="font-medium">Index utilisé:</span> {connectionTest.indexName}
              </p>
            )}
            {connectionTest.url && (
              <p className="mt-1 text-xs truncate">
                <span className="font-medium">URL fonctionnelle:</span> <span className="font-mono text-xs">{connectionTest.url}</span>
              </p>
            )}
            <p className="mt-2 text-xs">
              <span className="font-medium">Vérifié le:</span> {connectionTest.timestamp ? new Date(connectionTest.timestamp).toLocaleString() : "N/A"}
            </p>
          </AlertDescription>
        </Alert>
      ) : (
        <ConnectionAlert
          connectionTest={connectionTest}
          onRetryTest={() => onTestConnection(null)}
        />
      )}
      
      <div className="border rounded-md p-4">
        <h3 className="text-sm font-medium mb-2">Détails de connexion</h3>
        <div className="space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Statut:</span>
            <Badge variant={connectionTest.success ? "success" : "destructive"}>
              {connectionTest.success ? "Connecté" : "Échec"}
            </Badge>
          </div>
          
          {connectionTest.status && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Code HTTP:</span>
              <Badge variant={connectionTest.status === 200 ? "success" : "destructive"}>
                {connectionTest.status}
              </Badge>
            </div>
          )}
          
          {connectionTest.apiType && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type d'API:</span>
              <span className="font-mono">{connectionTest.apiType}</span>
            </div>
          )}
          
          {connectionTest.indexName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Index:</span>
              <span className="font-mono">{connectionTest.indexName}</span>
            </div>
          )}
          
          {connectionTest.timestamp && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timestamp:</span>
              <span>{new Date(connectionTest.timestamp).toLocaleString()}</span>
            </div>
          )}
          
          {connectionTest.testedUrls && connectionTest.testedUrls.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-1">URLs testées:</p>
              <div className="bg-muted p-2 rounded font-mono text-xs">
                {connectionTest.testedUrls.map((url: string, i: number) => (
                  <div key={i} className="truncate">{url}</div>
                ))}
              </div>
            </div>
          )}
          
          {connectionTest.error && (
            <div>
              <p className="text-muted-foreground mb-1">Erreur détaillée:</p>
              <div className="bg-red-50 border border-red-200 p-2 rounded text-red-700 font-mono text-xs overflow-x-auto">
                {connectionTest.error}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <TestConnectionButton 
          onTestComplete={onTestConnection}
          isLoading={isLoading}
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={openPineconeConsole}
          className="flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          Console Pinecone
        </Button>
      </div>
    </div>
  );
};

export default ConnectionTestTab;
