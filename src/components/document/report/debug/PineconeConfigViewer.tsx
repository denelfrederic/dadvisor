
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PineconeConfigViewerProps {
  config: any;
  onRefresh?: () => void;
}

/**
 * Affiche les détails de configuration Pinecone de manière lisible
 */
const PineconeConfigViewer: React.FC<PineconeConfigViewerProps> = ({ config, onRefresh }) => {
  const { toast } = useToast();
  
  if (!config) return null;
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Le texte a été copié dans le presse-papier"
    });
  };
  
  const openPineconeConsole = () => {
    window.open("https://app.pinecone.io", "_blank");
  };
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <span>Configuration Pinecone</span>
          {config.valid ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Valide
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <AlertCircle className="h-3 w-3 mr-1" /> Incomplète
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Détails de la configuration actuelle
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Section URL */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            URL Pinecone
            <Badge variant={config.config?.pineconeUrlStatus === "valide" ? "outline" : "destructive"} className="ml-2">
              {config.config?.pineconeUrlStatus || "Non configurée"}
            </Badge>
          </h3>
          
          {config.config?.effectiveUrl && (
            <div className="text-xs flex items-center gap-2 bg-muted p-2 rounded">
              <code className="flex-1 truncate">{config.config.effectiveUrl}</code>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5" 
                onClick={() => copyToClipboard(config.config.effectiveUrl)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {config.urlChecks?.PINECONE_BASE_URL && config.urlChecks.PINECONE_BASE_URL.format === "invalide" && (
            <div className="text-xs text-red-600">
              L'URL configurée ne commence pas par http:// ou https://
            </div>
          )}
          
          {config.urlChecks?.PINECONE_BASE_URL && config.urlChecks.PINECONE_BASE_URL.containsPinecone === "non" && (
            <div className="text-xs text-red-600">
              L'URL configurée ne contient pas "pinecone.io"
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            Pour les API serverless, l'URL devrait contenir <code>aped-</code> ou <code>.serverless.</code>
          </div>
          
          {!config.config?.effectiveUrl && (
            <div className="text-xs text-red-600">
              Aucune URL Pinecone n'est configurée. Vérifiez le secret PINECONE_BASE_URL.
            </div>
          )}
        </div>
        
        {/* Section Index */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            Index Pinecone
            <Badge variant={config.config?.hasPineconeIndex ? "outline" : "secondary"} className="ml-2">
              {config.config?.hasPineconeIndex ? config.config.effectiveIndex : "Par défaut"}
            </Badge>
          </h3>
          
          {config.config?.effectiveIndex && (
            <div className="text-xs flex items-center gap-2 bg-muted p-2 rounded">
              <code className="flex-1">{config.config.effectiveIndex}</code>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5" 
                onClick={() => copyToClipboard(config.config.effectiveIndex)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {config.config?.isUsingDefaultIndex && (
            <div className="text-xs text-amber-600">
              Utilisation de l'index par défaut "{config.config.defaultIndex}". Pour une configuration optimale, définissez le secret PINECONE_INDEX.
            </div>
          )}
        </div>
        
        {/* Statut des clés API */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Clé Pinecone</h3>
            <Badge variant={config.config?.hasPineconeKey ? "outline" : "destructive"}>
              {config.config?.hasPineconeKey ? "Configurée" : "Manquante"}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Clé OpenAI</h3>
            <Badge variant={config.config?.hasOpenAIKey ? "outline" : "destructive"}>
              {config.config?.hasOpenAIKey ? "Configurée" : "Manquante"}
            </Badge>
          </div>
        </div>
        
        {/* Avertissements */}
        {config.warnings && config.warnings.length > 0 && (
          <div className="space-y-2 border-t pt-2">
            <h3 className="text-sm font-medium text-red-600">Problèmes détectés</h3>
            <ul className="list-disc pl-5 space-y-1 text-xs text-red-600">
              {config.warnings.map((warning: string, index: number) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={openPineconeConsole}
          className="text-xs"
        >
          <ExternalLink className="h-3 w-3 mr-2" />
          Console Pinecone
        </Button>
        
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Actualiser
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PineconeConfigViewer;
