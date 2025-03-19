
import React, { useState } from "react";
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
          />
        </TabsContent>
        
        <TabsContent value="test">
          <ConnectionTestTab connectionTest={connectionTest} />
        </TabsContent>
        
        <TabsContent value="openai">
          <OpenAITab addLog={addLog} />
        </TabsContent>
        
        <TabsContent value="logs">
          <LogsTab detailedLogs={detailedLogs} />
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
