
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";

interface OpenAIConfigCheckProps {
  openaiStatus: any;
  isChecking: boolean;
  checkOpenAIConfig: () => void;
}

/**
 * Composant pour vérifier la configuration OpenAI
 */
const OpenAIConfigCheck: React.FC<OpenAIConfigCheckProps> = ({
  openaiStatus,
  isChecking,
  checkOpenAIConfig
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Vérification OpenAI</h3>
        <Button 
          onClick={checkOpenAIConfig} 
          variant="outline" 
          size="sm"
          disabled={isChecking}
        >
          {isChecking ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          Vérifier la clé API
        </Button>
      </div>
      
      {openaiStatus && (
        <Alert variant={openaiStatus.success ? "default" : "destructive"}>
          <AlertTitle>
            {openaiStatus.success ? "Configuration valide" : "Problème détecté"}
          </AlertTitle>
          <AlertDescription>
            {openaiStatus.success ? (
              <p>La clé API OpenAI est correctement configurée. Modèle disponible: {openaiStatus.model || "Non spécifié"}</p>
            ) : (
              <p>{openaiStatus.error || "Erreur lors de la vérification de la clé API OpenAI"}</p>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default OpenAIConfigCheck;
