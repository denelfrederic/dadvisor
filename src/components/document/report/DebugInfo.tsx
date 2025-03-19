
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Bug, Wrench, RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DebugInfoProps {
  onGetInfo: () => void;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ onGetInfo }) => {
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const [pineconeStatus, setPineconeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("config");
  const [detailedLogs, setDetailedLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setDetailedLogs(prev => [...prev, `[${new Date().toISOString().substring(11, 19)}] ${message}`]);
  };

  const clearLogs = () => {
    setDetailedLogs([]);
  };

  const getPineconeConfig = async () => {
    setPineconeStatus('loading');
    setDetailedLogs([]);
    addLog("Récupération de la configuration Pinecone...");
    
    try {
      toast({
        title: "Récupération des informations",
        description: "Vérification de la configuration Pinecone en cours..."
      });
      
      addLog("Appel de l'edge function pinecone-vectorize avec action='config'");
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { action: 'config' }
      });
      
      if (error) {
        addLog(`ERREUR: ${error.message}`);
        toast({
          title: "Erreur",
          description: `Échec de la récupération des informations: ${error.message}`,
          variant: "destructive"
        });
        setDiagnosticInfo({ error: error.message });
        setPineconeStatus('error');
        return;
      }
      
      addLog(`Réponse reçue: ${JSON.stringify(data).substring(0, 200)}...`);
      setDiagnosticInfo(data);
      setPineconeStatus('success');
      toast({
        title: "Succès",
        description: "Informations de diagnostic récupérées avec succès"
      });
    } catch (error) {
      addLog(`EXCEPTION: ${error instanceof Error ? error.message : String(error)}`);
      setPineconeStatus('error');
      toast({
        title: "Erreur",
        description: `Exception: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    }
  };

  const testPineconeConnection = async () => {
    addLog("Début du test de connexion à Pinecone...");
    
    try {
      toast({
        title: "Test de connexion",
        description: "Test de connexion à Pinecone en cours..."
      });
      
      addLog("Appel de l'edge function pinecone-vectorize avec action='test-connection'");
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { action: 'test-connection' }
      });
      
      if (error) {
        addLog(`ERREUR: ${error.message}`);
        toast({
          title: "Échec du test",
          description: `Impossible de se connecter à Pinecone: ${error.message}`,
          variant: "destructive"
        });
        setConnectionTest({ success: false, error: error.message });
        return;
      }
      
      addLog(`Réponse reçue: ${JSON.stringify(data).substring(0, 200)}...`);
      setConnectionTest(data);
      
      if (data.success) {
        addLog("Test de connexion réussi!");
        toast({
          title: "Connexion réussie",
          description: "Connexion à Pinecone établie avec succès"
        });
      } else {
        addLog(`Échec du test: ${data.message || "Raison inconnue"}`);
        toast({
          title: "Échec de connexion",
          description: data.message || "Échec de la connexion à Pinecone",
          variant: "destructive"
        });
      }
    } catch (error) {
      addLog(`EXCEPTION: ${error instanceof Error ? error.message : String(error)}`);
      setConnectionTest({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      });
      toast({
        title: "Erreur",
        description: `Exception lors du test: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Diagnostic Pinecone
        </h3>
        <div className="flex gap-2">
          <Button 
            onClick={getPineconeConfig} 
            variant="outline" 
            size="sm"
            disabled={pineconeStatus === 'loading'}
          >
            {pineconeStatus === 'loading' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Wrench className="h-4 w-4 mr-2" />
            )}
            Vérifier config
          </Button>
          <Button
            onClick={testPineconeConnection}
            variant="outline"
            size="sm"
            disabled={pineconeStatus === 'loading'}
          >
            {connectionTest?.success ? (
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            ) : connectionTest ? (
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Tester connexion
          </Button>
          <Button
            onClick={clearLogs}
            variant="outline"
            size="sm"
            disabled={detailedLogs.length === 0}
          >
            Effacer logs
          </Button>
        </div>
      </div>
      
      {connectionTest && !connectionTest.success && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Échec du test</AlertTitle>
          <AlertDescription>
            {connectionTest.message || "Impossible de se connecter à Pinecone"}
            {connectionTest.error && (
              <div className="mt-2 text-xs">
                <strong>Détails de l'erreur:</strong> {connectionTest.error}
              </div>
            )}
            {connectionTest.details && (
              <div className="mt-2 text-xs">
                <strong>Réponse du serveur:</strong> {connectionTest.details}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="test">Test de connexion</TabsTrigger>
          <TabsTrigger value="logs">Logs détaillés</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config">
          {diagnosticInfo ? (
            <ScrollArea className="h-[200px] border rounded-md p-2 bg-black/90 text-white font-mono">
              <div className="space-y-1 text-xs">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(diagnosticInfo, null, 2)}
                </pre>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-20 text-center p-4 text-gray-400 border rounded-md">
              <p className="text-sm">Cliquez sur "Vérifier config" pour diagnostiquer la configuration Pinecone</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="test">
          {connectionTest ? (
            <ScrollArea className="h-[200px] border rounded-md p-2 bg-black/90 text-white font-mono">
              <div className="space-y-1 text-xs">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(connectionTest, null, 2)}
                </pre>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-20 text-center p-4 text-gray-400 border rounded-md">
              <p className="text-sm">Cliquez sur "Tester connexion" pour vérifier l'accès à Pinecone</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="logs">
          <ScrollArea className="h-[200px] border rounded-md p-2 bg-black/90 text-white font-mono">
            {detailedLogs.length > 0 ? (
              <div className="space-y-1 text-xs">
                {detailedLogs.map((log, index) => (
                  <div key={index} className="whitespace-pre-wrap">{log}</div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-20 text-center p-4 text-gray-400">
                <p className="text-sm">Aucun log disponible. Exécutez une action pour générer des logs.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>Utilisez cet outil pour vérifier la configuration de connexion à Pinecone et diagnostiquer les problèmes d'indexation.</p>
        {diagnosticInfo && diagnosticInfo.valid === false && (
          <p className="text-red-500 mt-1">⚠️ La configuration actuelle est invalide. Vérifiez que la clé API Pinecone est configurée correctement.</p>
        )}
        {connectionTest && !connectionTest.success && (
          <p className="text-orange-500 mt-1">💡 Conseil: vérifiez que l'URL Pinecone et le format de requête sont corrects pour votre version de l'API Pinecone.</p>
        )}
      </div>
    </Card>
  );
};

export default DebugInfo;
