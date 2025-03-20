
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, RefreshCw, Server, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PineconeConfigViewer from "@/components/document/report/debug/PineconeConfigViewer";
import PineconeUrlHelper from "@/components/document/report/debug/PineconeUrlHelper";
import PineconeIndexSetting from "@/components/document/report/debug/PineconeIndexSetting";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Page de configuration Pinecone pour l'admin
 */
const PineconeSettings = () => {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("config");
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { action: 'config' }
      });
      
      if (error) {
        throw error;
      }
      
      setConfig(data);
    } catch (error) {
      console.error("Erreur lors de la récupération de la configuration:", error);
      toast({
        title: "Erreur",
        description: `Impossible de récupérer la configuration: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUrlUpdate = (newUrl: string) => {
    // Mise à jour optimiste de la configuration locale
    if (config) {
      setConfig({
        ...config,
        config: {
          ...config.config,
          effectiveUrl: newUrl,
          hasPineconeUrl: true,
          pineconeUrlStatus: "valide"
        }
      });
    }
    
    // Rafraîchir la configuration complète après un court délai
    setTimeout(fetchConfig, 1000);
  };
  
  const handleIndexUpdate = (newIndex: string) => {
    // Mise à jour optimiste de la configuration locale
    if (config) {
      setConfig({
        ...config,
        config: {
          ...config.config,
          effectiveIndex: newIndex,
          hasPineconeIndex: true,
          isUsingDefaultIndex: false
        }
      });
    }
    
    // Rafraîchir la configuration complète après un court délai
    setTimeout(fetchConfig, 1000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" />
          Configuration Pinecone
        </CardTitle>
        <CardDescription>
          Configurer l'intégration avec Pinecone pour l'indexation vectorielle
        </CardDescription>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList>
            <TabsTrigger value="config">
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="url">
              <Server className="h-4 w-4 mr-2" />
              URL
            </TabsTrigger>
            <TabsTrigger value="index">
              <Database className="h-4 w-4 mr-2" />
              Index
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading && !config ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Chargement de la configuration...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "config" && (
              <PineconeConfigViewer 
                config={config} 
                onRefresh={fetchConfig} 
              />
            )}
            
            {activeTab === "url" && (
              <PineconeUrlHelper 
                currentUrl={config?.config?.effectiveUrl} 
                onUrlUpdate={handleUrlUpdate} 
              />
            )}
            
            {activeTab === "index" && (
              <PineconeIndexSetting 
                currentIndex={config?.config?.effectiveIndex}
                defaultIndex={config?.config?.defaultIndex}
                onIndexUpdate={handleIndexUpdate}
              />
            )}
            
            {!config && !isLoading && (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Impossible de charger la configuration</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchConfig}
                  className="mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PineconeSettings;
