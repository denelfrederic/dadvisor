
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { checkOpenAIConfig, generateTestEmbedding } from "../utils/openai";

interface OpenAITabProps {
  addLog: (message: string) => void;
}

/**
 * Onglet de diagnostic pour tester le service OpenAI
 * Permet de vérifier la configuration et générer des embeddings de test
 */
const OpenAITab: React.FC<OpenAITabProps> = ({ addLog }) => {
  const [openAIStatus, setOpenAIStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [openAIInfo, setOpenAIInfo] = useState<any>(null);
  const [testText, setTestText] = useState("Ceci est un texte de test pour générer un embedding");
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  const checkOpenAIStatus = async () => {
    setOpenAIStatus('loading');
    addLog("Vérification de la configuration OpenAI...");
    
    try {
      const result = await checkOpenAIConfig();
      
      if (result.success) {
        setOpenAIStatus('success');
        setOpenAIInfo(result.data);
        addLog(`Configuration OpenAI vérifiée avec succès. Modèle disponible: ${result.data?.model || 'non spécifié'}`);
      } else {
        setOpenAIStatus('error');
        setOpenAIInfo({ error: result.error });
        addLog(`Erreur lors de la vérification OpenAI: ${result.error}`);
      }
    } catch (error) {
      setOpenAIStatus('error');
      setOpenAIInfo({ error: error instanceof Error ? error.message : String(error) });
      addLog(`Exception lors de la vérification OpenAI: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  const testEmbedding = async () => {
    if (!testText.trim()) {
      addLog("Le texte de test ne peut pas être vide");
      return;
    }
    
    setTestLoading(true);
    setTestResult(null);
    addLog(`Génération d'un embedding de test pour: "${testText.substring(0, 30)}..."`);
    
    try {
      const result = await generateTestEmbedding(testText);
      
      if (result.success) {
        const embedding = result.data.embedding;
        setTestResult({
          success: true,
          dimensions: embedding.length,
          sample: embedding.slice(0, 5),
          model: result.data.model || "text-embedding-3-small"
        });
        addLog(`Embedding généré avec succès: ${embedding.length} dimensions`);
      } else {
        setTestResult({
          success: false,
          error: result.error
        });
        addLog(`Erreur lors de la génération de l'embedding: ${result.error}`);
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      addLog(`Exception lors de la génération de l'embedding: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Configuration OpenAI</h3>
        <Button 
          onClick={checkOpenAIStatus} 
          variant="outline" 
          size="sm"
          disabled={openAIStatus === 'loading'}
        >
          {openAIStatus === 'loading' ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            openAIStatus === 'success' ? (
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            ) : openAIStatus === 'error' ? (
              <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
            ) : null
          )}
          Vérifier configuration
        </Button>
      </div>
      
      {openAIInfo && (
        <Card className="p-3 text-sm">
          {openAIStatus === 'success' ? (
            <div>
              <div className="flex items-center mb-2">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                <span className="font-medium">Configuration OpenAI valide</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Modèle:</span> {openAIInfo.model || "text-embedding-3-small"}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center text-red-500">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span>{openAIInfo.error || "Erreur inconnue"}</span>
            </div>
          )}
        </Card>
      )}
      
      <div className="border-t pt-4 mt-4">
        <h3 className="text-sm font-medium mb-2">Test de génération d'embedding</h3>
        <Textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="Entrez du texte pour générer un embedding de test"
          className="h-20 mb-2"
        />
        <div className="flex justify-end">
          <Button 
            onClick={testEmbedding} 
            disabled={testLoading || !testText.trim()}
            size="sm"
          >
            {testLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            Générer un embedding
          </Button>
        </div>
        
        {testResult && (
          <Card className="p-3 mt-3 text-sm">
            {testResult.success ? (
              <div>
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  <span className="font-medium">Embedding généré avec succès</span>
                </div>
                <div>
                  <div><span className="font-medium">Dimensions:</span> {testResult.dimensions}</div>
                  <div><span className="font-medium">Modèle:</span> {testResult.model}</div>
                  <div className="mt-1">
                    <span className="font-medium">Échantillon:</span>
                    <pre className="bg-gray-100 p-1 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(testResult.sample, null, 2)}...
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center text-red-500">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span>{testResult.error || "Erreur inconnue"}</span>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default OpenAITab;
