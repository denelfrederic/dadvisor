
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Bug, Wrench, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DebugInfoProps {
  onGetInfo: () => void;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ onGetInfo }) => {
  const [diagnosticInfo, setDiagnosticInfo] = React.useState<any>(null);
  const [pineconeStatus, setPineconeStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [connectionTest, setConnectionTest] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState("config");

  const getPineconeConfig = async () => {
    setPineconeStatus('loading');
    try {
      toast({
        title: "Récupération des informations",
        description: "Vérification de la configuration Pinecone en cours..."
      });
      
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { action: 'config' }
      });
      
      if (error) {
        toast({
          title: "Erreur",
          description: `Échec de la récupération des informations: ${error.message}`,
          variant: "destructive"
        });
        setDiagnosticInfo({ error: error.message });
        setPineconeStatus('error');
        return;
      }
      
      setDiagnosticInfo(data);
      setPineconeStatus('success');
      toast({
        title: "Succès",
        description: "Informations de diagnostic récupérées avec succès"
      });
    } catch (error) {
      setPineconeStatus('error');
      toast({
        title: "Erreur",
        description: `Exception: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    }
  };

  const testPineconeConnection = async () => {
    try {
      toast({
        title: "Test de connexion",
        description: "Test de connexion à Pinecone en cours..."
      });
      
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { action: 'test-connection' }
      });
      
      if (error) {
        toast({
          title: "Échec du test",
          description: `Impossible de se connecter à Pinecone: ${error.message}`,
          variant: "destructive"
        });
        setConnectionTest({ success: false, error: error.message });
        return;
      }
      
      setConnectionTest(data);
      
      if (data.success) {
        toast({
          title: "Connexion réussie",
          description: "Connexion à Pinecone établie avec succès"
        });
      } else {
        toast({
          title: "Échec de connexion",
          description: data.message || "Échec de la connexion à Pinecone",
          variant: "destructive"
        });
      }
    } catch (error) {
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
        </div>
      </div>
      
      {(diagnosticInfo || connectionTest) && (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-2">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="test">Test de connexion</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config">
            {diagnosticInfo && (
              <ScrollArea className="h-[200px] border rounded-md p-2 bg-black/90 text-white font-mono">
                <div className="space-y-1 text-xs">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(diagnosticInfo, null, 2)}
                  </pre>
                </div>
              </ScrollArea>
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
        </Tabs>
      )}
      
      {!diagnosticInfo && !connectionTest && (
        <div className="flex flex-col items-center justify-center h-20 text-center p-4 text-gray-400 border rounded-md">
          <p className="text-sm">Cliquez sur "Vérifier config" pour diagnostiquer la connexion Pinecone</p>
        </div>
      )}
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>Utilisez cet outil pour vérifier la configuration de connexion à Pinecone et diagnostiquer les problèmes d'indexation.</p>
      </div>
    </Card>
  );
};

export default DebugInfo;
