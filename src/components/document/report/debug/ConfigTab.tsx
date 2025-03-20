
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CircleAlert, CircleCheck, ServerCrash, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfigTabProps {
  diagnosticInfo: any;
  pineconeStatus: 'idle' | 'loading' | 'success' | 'error';
  onRefresh?: () => void;
}

const ConfigTab: React.FC<ConfigTabProps> = ({ 
  diagnosticInfo, 
  pineconeStatus,
  onRefresh 
}) => {
  if (pineconeStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
        <p className="text-muted-foreground text-sm">Récupération des informations de configuration...</p>
      </div>
    );
  }
  
  if (pineconeStatus === 'error' || !diagnosticInfo) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            {diagnosticInfo?.error || "Impossible de récupérer les informations de configuration Pinecone"}
          </AlertDescription>
        </Alert>
        
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            className="mt-2 flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
        )}
      </div>
    );
  }
  
  if (!diagnosticInfo?.config) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <ServerCrash className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">Configuration Pinecone indisponible</p>
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            className="mt-2 flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser la configuration
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {diagnosticInfo.valid ? (
        <Alert>
          <CircleCheck className="h-4 w-4" />
          <AlertTitle>Configuration valide</AlertTitle>
          <AlertDescription>
            Toutes les variables d'environnement nécessaires sont configurées
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <CircleAlert className="h-4 w-4" />
          <AlertTitle>Configuration incomplète</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
              {diagnosticInfo.warnings?.map((warning: string, index: number) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="border rounded-md p-4">
        <h3 className="text-sm font-medium mb-2">Variables d'environnement</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Clé API Pinecone:</span>
            <Badge variant={diagnosticInfo.config.hasPineconeKey ? "outline" : "destructive"}>
              {diagnosticInfo.config.hasPineconeKey ? "Configurée" : "Manquante"}
            </Badge>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">URL Pinecone:</span>
            <Badge variant={diagnosticInfo.config.hasPineconeUrl ? "outline" : "destructive"}>
              {diagnosticInfo.config.pineconeUrlStatus || "Non configurée"}
            </Badge>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">URL Alternative:</span>
            <Badge variant={diagnosticInfo.config.hasAlternativeUrl ? "outline" : "destructive"}>
              {diagnosticInfo.config.hasAlternativeUrl ? "Configurée" : "Non configurée"}
            </Badge>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Index Pinecone:</span>
            <Badge variant={diagnosticInfo.config.hasPineconeIndex ? "outline" : "destructive"}>
              {diagnosticInfo.config.effectiveIndex || "Non configuré"}
            </Badge>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Clé API OpenAI:</span>
            <Badge variant={diagnosticInfo.config.hasOpenAIKey ? "outline" : "destructive"}>
              {diagnosticInfo.config.hasOpenAIKey ? "Configurée" : "Manquante"}
            </Badge>
          </div>
        </div>
      </div>
      
      {diagnosticInfo.config.effectiveUrl && (
        <div className="border rounded-md p-4">
          <h3 className="text-sm font-medium mb-2">Détails de configuration</h3>
          <div className="space-y-3">
            <div>
              <span className="text-muted-foreground text-xs">URL effective:</span>
              <div className="bg-muted p-2 mt-1 rounded font-mono text-xs overflow-x-auto">
                {diagnosticInfo.config.effectiveUrl}
              </div>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground text-xs">Index utilisé:</span>
              <span className="font-mono text-xs">
                {diagnosticInfo.config.effectiveIndex}
                {diagnosticInfo.config.isUsingDefaultIndex && " (par défaut)"}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground text-xs">Dernière vérification:</span>
              <span className="text-xs">
                {diagnosticInfo.timestamp ? new Date(diagnosticInfo.timestamp).toLocaleString() : "N/A"}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {onRefresh && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          className="mt-2 w-full flex items-center gap-1 justify-center"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser la configuration
        </Button>
      )}
    </div>
  );
};

export default ConfigTab;
