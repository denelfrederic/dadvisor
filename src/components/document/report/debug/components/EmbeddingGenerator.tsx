
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EmbeddingGeneratorProps {
  testText: string;
  setTestText: (value: string) => void;
  testResult: any;
  isGenerating: boolean;
  generateTestEmbedding: () => void;
}

/**
 * Composant pour générer et tester des embeddings avec OpenAI
 */
const EmbeddingGenerator: React.FC<EmbeddingGeneratorProps> = ({
  testText,
  setTestText,
  testResult,
  isGenerating,
  generateTestEmbedding,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Test d'embedding</h3>
        <Button
          onClick={generateTestEmbedding}
          variant="outline"
          size="sm"
          disabled={isGenerating || !testText.trim()}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          Générer un embedding
        </Button>
      </div>

      <Textarea
        placeholder="Entrez un texte pour générer un embedding..."
        value={testText}
        onChange={(e) => setTestText(e.target.value)}
        className="h-24"
      />

      {testResult && (
        <>
          {testResult.success ? (
            <Alert>
              <AlertTitle>Embedding généré avec succès</AlertTitle>
              <AlertDescription>
                <div className="text-xs space-y-1">
                  <p>
                    <strong>Modèle:</strong> {testResult.model || "Non spécifié"}
                  </p>
                  <p>
                    <strong>Dimensions:</strong> {testResult.dimensions || testResult.embedding?.length || "Non spécifié"}
                  </p>
                  <p>
                    <strong>Premiers éléments:</strong>{" "}
                    {testResult.embedding
                      ? testResult.embedding
                          .slice(0, 5)
                          .map((v: number) => v.toFixed(4))
                          .join(", ") + "..."
                      : "N/A"}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>
                {testResult.error || "Erreur lors de la génération de l'embedding"}
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
};

export default EmbeddingGenerator;
