
import React from "react";
import { useOpenAICheck } from "./hooks/useOpenAICheck";
import OpenAIConfigCheck from "./components/OpenAIConfigCheck";
import EmbeddingGenerator from "./components/EmbeddingGenerator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    edgeFunctionError,
    checkOpenAIConfig,
    generateTestEmbedding
  } = useOpenAICheck(addLog);

  // Si une erreur de communication est détectée
  const hasEdgeFunctionError = 
    edgeFunctionError || 
    (openaiStatus?.error && openaiStatus.error.includes("Failed to send")) ||
    (testResult?.error && testResult.error.includes("Failed to send"));

  // Fonction pour actualiser la page
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      {hasEdgeFunctionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Problème de connexion aux fonctions edge</AlertTitle>
          <AlertDescription>
            <p>Impossible de communiquer avec les fonctions edge. Cela peut être dû à:</p>
            <ul className="list-disc pl-5 mt-2 text-sm">
              <li>Une fonction edge non déployée ou en cours de déploiement</li>
              <li>Un problème temporaire avec Supabase Edge Functions</li>
              <li>Un bloqueur de publicités ou un pare-feu qui bloque les requêtes</li>
            </ul>
            <div className="mt-2 flex flex-col gap-2">
              <p className="text-sm">
                Conseils:
              </p>
              <ul className="list-disc pl-5 text-sm">
                <li>Patientez quelques minutes pour que le déploiement se termine</li>
                <li>Vérifiez que vous n'avez pas d'extension qui bloque les requêtes</li>
                <li>Essayez d'actualiser la page</li>
              </ul>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="mt-2 self-start"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser la page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {openaiStatus && openaiStatus.valid === false && openaiStatus.warnings && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Avertissements de configuration</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2 text-sm">
              {openaiStatus.warnings.map((warning: string, index: number) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
            <div className="mt-2 text-sm">
              <p>Pour résoudre ces problèmes, vérifiez les variables d'environnement de votre fonction edge.</p>
              {openaiStatus.warnings.includes("PINECONE_INDEX manquant") && (
                <div className="mt-1 p-2 bg-amber-50 text-amber-800 rounded-md">
                  <p className="font-medium">Vous devez configurer PINECONE_INDEX</p>
                  <p>Sans cette variable, l'indexation Pinecone ne fonctionnera pas correctement.</p>
                </div>
              )}
            </div>
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
