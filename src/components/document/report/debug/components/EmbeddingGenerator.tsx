
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Zap } from "lucide-react";

interface EmbeddingGeneratorProps {
  testText: string;
  setTestText: (text: string) => void;
  testResult: any;
  isGenerating: boolean;
  generateTestEmbedding: () => void;
}

/**
 * Composant pour générer des embeddings de test
 */
const EmbeddingGenerator: React.FC<EmbeddingGeneratorProps> = ({
  testText,
  setTestText,
  testResult,
  isGenerating,
  generateTestEmbedding
}) => {
  return (
    <div className="space-y-2 mt-4">
      <h3 className="text-sm font-medium">Test de génération d'embeddings</h3>
      <Textarea 
        value={testText}
        onChange={(e) => setTestText(e.target.value)}
        placeholder="Entrez un texte pour générer un embedding..."
        className="h-20"
      />
      <Button
        onClick={generateTestEmbedding}
        disabled={isGenerating || !testText.trim()}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Zap className="h-4 w-4 mr-2" />
        )}
        Générer un embedding
      </Button>
      
      {testResult && (
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
      )}
    </div>
  );
};

export default EmbeddingGenerator;
