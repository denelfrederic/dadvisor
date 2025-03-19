
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface OpenAITabProps {
  addLog: (message: string) => void;
}

const OpenAITab: React.FC<OpenAITabProps> = ({ addLog }) => {
  const [openaiStatus, setOpenaiStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [testText, setTestText] = useState("Ceci est un test pour générer un embedding avec OpenAI");
  const [testResult, setTestResult] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Vérifier l'état de la configuration OpenAI
  const checkOpenAIConfig = async () => {
    setIsChecking(true);
    setOpenaiStatus(null);
    
    try {
      addLog("Vérification de la configuration OpenAI...");
      
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { action: 'check-openai' }
      });
      
      if (error) {
        addLog(`ERREUR: ${error.message}`);
        setOpenaiStatus({ success: false, error: error.message });
        return;
      }
      
      addLog(`Réponse reçue: ${JSON.stringify(data)}`);
      setOpenaiStatus(data);
      
    } catch (error) {
      addLog(`EXCEPTION: ${error instanceof Error ? error.message : String(error)}`);
      setOpenaiStatus({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Générer un embedding de test
  const generateTestEmbedding = async () => {
    if (!testText.trim()) return;
    
    setIsGenerating(true);
    setTestResult(null);
    
    try {
      addLog(`Génération d'un embedding pour le texte: "${testText.substring(0, 50)}..."`);
      
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { 
          action: 'generate-embedding',
          text: testText
        }
      });
      
      if (error) {
        addLog(`ERREUR: ${error.message}`);
        setTestResult({ success: false, error: error.message });
        return;
      }
      
      addLog(`Embedding généré avec succès (${data.dimensions} dimensions)`);
      setTestResult(data);
      
    } catch (error) {
      addLog(`EXCEPTION: ${error instanceof Error ? error.message : String(error)}`);
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
    } finally {
      setIsGenerating(false);
    }
  };

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
      </div>
      
      {testResult && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Résultat:</h4>
          {testResult.success ? (
            <div className="space-y-2">
              <div className="flex space-x-2 text-xs">
                <span className="font-medium">Modèle:</span>
                <span>{testResult.model || "Non spécifié"}</span>
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

export default OpenAITab;
