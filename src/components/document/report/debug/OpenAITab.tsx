
import React from "react";
import { useOpenAICheck } from "./hooks/useOpenAICheck";
import OpenAIConfigCheck from "./components/OpenAIConfigCheck";
import EmbeddingGenerator from "./components/EmbeddingGenerator";

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

  return (
    <div className="space-y-4">
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
