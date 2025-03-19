
import React from "react";
import { useOpenAICheck } from "./hooks/useOpenAICheck";
import OpenAIConfigCheck from "./components/OpenAIConfigCheck";
import EmbeddingGenerator from "./components/EmbeddingGenerator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface OpenAITabProps {
  addLog: (message: string) => void;
}

/**
 * Onglet pour la vérification et les tests OpenAI
 */
const OpenAITab: React.FC<OpenAITabProps> = ({ addLog }) => {
  const {
    openaiStatus,
    isChecking,
    testText,
    setTestText,
    testResult,
    isGenerating,
    checkOpenAIConfig,
    generateTestEmbedding
  } = useOpenAICheck(addLog);

  // Si une erreur de communication est détectée
  const hasEdgeFunctionError = 
    (openaiStatus?.error && openaiStatus.error.includes("Failed to send")) ||
    (testResult?.error && testResult.error.includes("Failed to send"));

  return (
    <div className="space-y-4">
      {hasEdgeFunctionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Problème de connexion</AlertTitle>
          <AlertDescription>
            <p>Impossible de communiquer avec les fonctions edge. Cela peut être dû à:</p>
            <ul className="list-disc pl-5 mt-2 text-sm">
              <li>Une fonction edge non déployée ou en cours de déploiement</li>
              <li>Un problème temporaire avec Supabase Edge Functions</li>
              <li>Un bloqueur de publicités ou un pare-feu qui bloque les requêtes</li>
            </ul>
            <p className="mt-2 text-sm">
              Conseil: essayez de rafraîchir la page ou de réessayer dans quelques instants.
            </p>
          </AlertDescription>
        </Alert>
      )}
      
      <OpenAIConfigCheck
        openaiStatus={openaiStatus}
        isChecking={isChecking}
        checkOpenAIConfig={checkOpenAIConfig}
      />
      
      <EmbeddingGenerator
        testText={testText}
        setTestText={setTestText}
        testResult={testResult}
        isGenerating={isGenerating}
        generateTestEmbedding={generateTestEmbedding}
      />
    </div>
  );
};

export default OpenAITab;
