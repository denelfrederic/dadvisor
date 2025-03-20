
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Server, AlertCircle } from "lucide-react";
import TestConnectionButton from "./TestConnectionButton";

interface ConfigTabProps {
  config: any;
  isLoading: boolean;
  onRefreshConfig: () => void;
  onTestConnection: (result: any) => void;
}

const ConfigTab: React.FC<ConfigTabProps> = ({ 
  config, 
  isLoading, 
  onRefreshConfig,
  onTestConnection
}) => {
  if (!config) return null;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-md p-4">
          <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
            <Server className="h-4 w-4 text-primary" />
            Configuration Pinecone
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Clé API:</span>
              <Badge variant={config.envStatus?.PINECONE_API_KEY ? "success" : "destructive"}>
                {config.envStatus?.PINECONE_API_KEY ? "Configurée" : "Manquante"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">URL Principale:</span>
              <Badge variant={config.envStatus?.PINECONE_BASE_URL ? "success" : "destructive"}>
                {config.urlChecks?.PINECONE_BASE_URL?.format || "Non configurée"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">URL Alternative:</span>
              <Badge variant={config.envStatus?.ALTERNATIVE_PINECONE_URL ? "outline" : "default"}>
                {config.urlChecks?.ALTERNATIVE_PINECONE_URL?.format || "Non configurée"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Index:</span>
              <Badge variant={config.envStatus?.PINECONE_INDEX ? "success" : "outline"}>
                {config.envStatus?.PINECONE_INDEX ? "Configuré" : "Par défaut"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">OpenAI API:</span>
              <Badge variant={config.envStatus?.OPENAI_API_KEY ? "success" : "destructive"}>
                {config.envStatus?.OPENAI_API_KEY ? "Configurée" : "Manquante"}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="border rounded-md p-4">
          <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
            <Server className="h-4 w-4 text-primary" />
            Détails de la configuration
          </h3>
          <div className="space-y-2">
            {config.valid === false && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-2 mb-2 text-amber-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-amber-600" />
                  <div>
                    <p className="text-xs font-medium">Configuration incomplète</p>
                    <ul className="text-xs list-disc pl-4 mt-1">
                      {config.warnings?.map((warning: string, i: number) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">Informations système:</p>
              <div className="text-xs bg-muted p-2 rounded font-mono">
                <div>Deno: {config.runtimeInfo?.denoVersion}</div>
                <div>V8: {config.runtimeInfo?.v8Version}</div>
                <div>TypeScript: {config.runtimeInfo?.typescriptVersion}</div>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-1">URL validées:</p>
              <div className="text-xs space-y-1">
                {config.urlChecks?.PINECONE_BASE_URL && (
                  <div>
                    <span className="font-medium">URL principale:</span>{" "}
                    <span className={config.urlChecks.PINECONE_BASE_URL.containsPinecone === "oui" ? "text-green-600" : "text-red-600"}>
                      {config.urlChecks.PINECONE_BASE_URL.containsPinecone === "oui" ? "Format valide" : "Format suspect"}
                    </span>
                    {" "}
                    <span className="text-muted-foreground">
                      (contient "pinecone.io": {config.urlChecks.PINECONE_BASE_URL.containsPinecone})
                    </span>
                  </div>
                )}
                
                {config.urlChecks?.ALTERNATIVE_PINECONE_URL && (
                  <div>
                    <span className="font-medium">URL alternative:</span>{" "}
                    <span className={config.urlChecks.ALTERNATIVE_PINECONE_URL.containsPinecone === "oui" ? "text-green-600" : "text-red-600"}>
                      {config.urlChecks.ALTERNATIVE_PINECONE_URL.containsPinecone === "oui" ? "Format valide" : "Format suspect"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground">Dernière vérification:</p>
              <p className="text-xs font-mono">
                {config.timestamp ? new Date(config.timestamp).toLocaleString() : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefreshConfig}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Actualiser la configuration
        </Button>
        
        <TestConnectionButton 
          onTestComplete={onTestConnection}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ConfigTab;
