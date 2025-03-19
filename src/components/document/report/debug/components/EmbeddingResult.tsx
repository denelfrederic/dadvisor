
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EmbeddingResultProps {
  testResult: any;
}

/**
 * Composant pour afficher le résultat de la génération d'embedding
 */
const EmbeddingResult: React.FC<EmbeddingResultProps> = ({ testResult }) => {
  if (!testResult) return null;

  return (
    <div className="mt-4 space-y-2">
      <h4 className="text-sm font-medium">Résultat:</h4>
      {testResult.success ? (
        <div className="space-y-2">
          <div className="flex space-x-2 text-xs">
            <span className="font-medium">Modèle:</span>
            <span>{testResult.modelName || "Non spécifié"}</span>
          </div>
          <div className="flex space-x-2 text-xs">
            <span className="font-medium">Dimensions:</span>
            <span>{testResult.dimensions}</span>
          </div>
          <h5 className="text-xs font-medium mt-2">Vecteur d'embedding (premières 10 valeurs):</h5>
          <ScrollArea className="h-28 border rounded-md p-2 bg-black/90 text-white font-mono">
            <pre className="text-xs whitespace-pre-wrap">
              {testResult.embedding ? 
                JSON.stringify(testResult.embedding.slice(0, 10)) + "..." 
                : "Données non disponibles"}
            </pre>
          </ScrollArea>
        </div>
      ) : (
        <Alert variant="destructive">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            {testResult.error || "Échec de la génération de l'embedding"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EmbeddingResult;
