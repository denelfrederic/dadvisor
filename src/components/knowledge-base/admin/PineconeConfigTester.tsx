
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle, RefreshCw, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PineconeConfigTester = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    error?: string;
    details?: Record<string, any>;
  } | null>(null);

  const addLog = (message: string) => {
    console.log(message);
    const timestamp = new Date().toISOString().slice(11, 19);
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResult(null);
  };

  const testPineconeConfig = async () => {
    setIsTesting(true);
    clearLogs();
    
    try {
      addLog("Démarrage du test de configuration Pinecone...");
      
      // Vérifier si les secrets sont configurés via l'edge function
      addLog("Vérification des secrets et de la configuration Pinecone...");
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: {
          action: 'test-config'
        }
      });
      
      if (error) {
        addLog(`Erreur lors de l'appel de la fonction Edge: ${error.message}`);
        setTestResult({
          success: false,
          error: `Erreur lors de l'appel de la fonction Edge: ${error.message}`
        });
        return;
      }
      
      if (!data.success) {
        addLog(`Test de configuration échoué: ${data.error}`);
        setTestResult({
          success: false,
          error: data.error,
          details: data.details || {}
        });
        
        if (data.details?.apiKeyStatus === 'missing') {
          addLog("❌ La clé API Pinecone n'est pas configurée dans les secrets Supabase");
        }
        
        if (data.details?.environment) {
          addLog(`ℹ️ Environnement Pinecone configuré: ${data.details.environment}`);
        }
        
        if (data.details?.index) {
          addLog(`ℹ️ Index Pinecone configuré: ${data.details.index}`);
        }
        
        if (data.details?.connectionError) {
          addLog(`❌ Erreur de connexion: ${data.details.connectionError}`);
          addLog("Vérifiez que l'index et l'environnement sont corrects");
        }
      } else {
        addLog("✅ Connexion à Pinecone réussie!");
        addLog(`✅ Environnement: ${data.details.environment}`);
        addLog(`✅ Index: ${data.details.index}`);
        addLog(`✅ Version de l'API: ${data.details.serverVersion || 'N/A'}`);
        
        if (data.details.dimension) {
          addLog(`✅ Dimension de l'index: ${data.details.dimension}`);
        }
        
        if (data.details.count) {
          addLog(`ℹ️ Nombre de vecteurs dans l'index: ${data.details.count}`);
        }
        
        setTestResult({
          success: true,
          details: data.details
        });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      addLog(`Erreur lors du test: ${errorMessage}`);
      setTestResult({
        success: false,
        error: errorMessage
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-primary" />
          Diagnostic de configuration Pinecone
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button
          className="w-full"
          onClick={testPineconeConfig}
          disabled={isTesting}
        >
          {isTesting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Test en cours...
            </>
          ) : (
            "Tester la configuration Pinecone"
          )}
        </Button>
        
        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            {testResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {testResult.success ? "Configuration valide" : "Problème détecté"}
            </AlertTitle>
            <AlertDescription>
              {testResult.success
                ? "La connexion à Pinecone fonctionne correctement"
                : testResult.error}
              
              {!testResult.success && testResult.details?.suggestions && (
                <div className="mt-2 text-sm">
                  <p><strong>Suggestions:</strong></p>
                  <ul className="list-disc pl-5">
                    {testResult.details.suggestions.map((suggestion: string, i: number) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <ScrollArea className="h-60 border rounded-md p-2 bg-black/90 text-white font-mono">
          {logs.length > 0 ? (
            <div className="space-y-1 text-xs">
              {logs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap">
                  {log}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>Exécutez le test pour voir les logs</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          disabled={logs.length === 0}
          onClick={clearLogs}
        >
          Effacer les logs
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PineconeConfigTester;
