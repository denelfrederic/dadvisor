
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Bug } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Composants extraits
import ConfigTab from "./debug/ConfigTab";
import ConnectionTestTab from "./debug/ConnectionTestTab";
import LogsTab from "./debug/LogsTab";
import OpenAITab from "./debug/OpenAITab";
import ConnectionAlert from "./debug/ConnectionAlert";
import DebugActions from "./debug/DebugActions";
import DebugFooter from "./debug/DebugFooter";

interface DebugInfoProps {
  onGetInfo: () => void;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ onGetInfo }) => {
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const [pineconeStatus, setPineconeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("config");
  const [detailedLogs, setDetailedLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);

  // Effectuer une récupération initiale au chargement
  useEffect(() => {
    // Seulement si ce n'est pas déjà fait
    if (!initialLoadAttempted && pineconeStatus === 'idle') {
      getPineconeConfig();
    }
  }, [initialLoadAttempted, pineconeStatus]);

  const addLog = (message: string) => {
    setDetailedLogs(prev => [...prev, `[${new Date().toISOString().substring(11, 19)}] ${message}`]);
  };

  const clearLogs = () => {
    setDetailedLogs([]);
  };

  const handleTestConnection = async (result: any) => {
    setConnectionTest(result);
  };

  const getPineconeConfig = async () => {
    setPineconeStatus('loading');
    
    // N'effacez pas les logs existants lors de la récupération initiale
    if (initialLoadAttempted) {
      setDetailedLogs([]);
    }
    
    addLog("Récupération de la configuration Pinecone...");
    setIsLoading(true);
    
    try {
      // Ne pas afficher de toast lors du chargement initial
      if (initialLoadAttempted) {
        toast({
          title: "Récupération des informations",
          description: "Vérification de la configuration Pinecone en cours..."
        });
      }
      
      addLog("Appel de l'edge function pinecone-vectorize avec action='config'");
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { 
          action: 'config',
          _timestamp: new Date().getTime() // Éviter la mise en cache
        }
      });
      
      if (error) {
        addLog(`ERREUR: ${error.message}`);
        if (initialLoadAttempted) {
          toast({
            title: "Erreur",
            description: `Échec de la récupération des informations: ${error.message}`,
            variant: "destructive"
          });
        }
        setDiagnosticInfo({ error: error.message });
        setPineconeStatus('error');
        return;
      }
      
      addLog(`Réponse reçue: ${JSON.stringify(data).substring(0, 200)}...`);
      setDiagnosticInfo(data);
      setPineconeStatus('success');
      
      if (initialLoadAttempted) {
        toast({
          title: "Succès",
          description: "Informations de diagnostic récupérées avec succès"
        });
      }
    } catch (error) {
      addLog(`EXCEPTION: ${error instanceof Error ? error.message : String(error)}`);
      setPineconeStatus('error');
      
      if (initialLoadAttempted) {
        toast({
          title: "Erreur",
          description: `Exception: ${error instanceof Error ? error.message : String(error)}`,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
      setInitialLoadAttempted(true);
    }
  };

  const testPineconeConnection = async () => {
    addLog("Début du test de connexion à Pinecone...");
    setIsLoading(true);
    
    try {
      toast({
        title: "Test de connexion",
        description: "Test de connexion à Pinecone en cours..."
      });
      
      addLog("Appel de l'edge function pinecone-vectorize avec action='test-connection'");
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { 
          action: 'test-connection',
          _timestamp: new Date().getTime() // Éviter la mise en cache
        }
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Diagnostic Pinecone
        </h3>
        
        <DebugActions 
          onGetConfig={getPineconeConfig}
          onTestConnection={testPineconeConnection}
          onClearLogs={clearLogs}
          pineconeStatus={pineconeStatus}
          connectionTest={connectionTest}
          hasLogs={detailedLogs.length > 0}
        />
      </div>
      
      <ConnectionAlert connectionTest={connectionTest} />
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="test">Test de connexion</TabsTrigger>
          <TabsTrigger value="openai">OpenAI</TabsTrigger>
          <TabsTrigger value="logs">Logs détaillés</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config">
          <ConfigTab 
            diagnosticInfo={diagnosticInfo} 
            pineconeStatus={pineconeStatus}
            onRefresh={getPineconeConfig}
          />
        </TabsContent>
        
        <TabsContent value="test">
          <ConnectionTestTab 
            connectionTest={connectionTest} 
            onTestConnection={handleTestConnection}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="openai">
          <OpenAITab addLog={addLog} />
        </TabsContent>
        
        <TabsContent value="logs">
          <LogsTab 
            logs={detailedLogs}
            onClearLogs={clearLogs}
            onExportLogs={() => {
              // Logique d'export des logs
              const blob = new Blob([detailedLogs.join('\n')], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `pinecone-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          />
        </TabsContent>
      </Tabs>
      
      <DebugFooter 
        diagnosticInfo={diagnosticInfo} 
        connectionTest={connectionTest} 
      />
    </Card>
  );
};

export default DebugInfo;
