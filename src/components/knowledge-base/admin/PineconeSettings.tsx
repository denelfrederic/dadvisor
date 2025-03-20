
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, RefreshCw, Server, Settings, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PineconeConfigViewer from "@/components/document/report/debug/PineconeConfigViewer";
import PineconeUrlHelper from "@/components/document/report/debug/PineconeUrlHelper";
import PineconeIndexSetting from "@/components/document/report/debug/PineconeIndexSetting";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Page de configuration Pinecone pour l'admin
 */
const PineconeSettings = () => {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); // Modification ici: démarrer en état de chargement
  const [activeTab, setActiveTab] = useState("config");
  const [edgeFunctionError, setEdgeFunctionError] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false); // Nouvel état pour suivre les tentatives
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    setEdgeFunctionError(null);
    
    try {
      // Ajout d'un timestamp pour éviter les problèmes de cache
      const timestamp = new Date().getTime();
      console.log(`Tentative d'appel de la fonction edge avec timestamp ${timestamp}...`);
      
      // Utiliser un timeout pour détecter les problèmes de connectivité
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout: La requête a expiré après 15 secondes")), 15000);
      });
      
      // Faire la requête avec un race contre le timeout
      const fetchPromise = supabase.functions.invoke('pinecone-vectorize', {
        body: { 
          action: 'config',
          _timestamp: timestamp // Éviter la mise en cache
        }
      });
      
      // Race entre le fetch et le timeout
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error("Erreur lors de l'appel à la fonction edge:", error);
        
        // Diagnostic spécifique pour les erreurs
        if (error.message && error.message.includes("Failed to send")) {
          setEdgeFunctionError("Erreur de connexion à la fonction Edge: " + error.message);
          toast({
            title: "Erreur de connexion",
            description: "Impossible de contacter la fonction Edge. Vérifiez que la fonction est correctement déployée.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }
      
      console.log("Réponse de la fonction edge reçue:", data);
      setConfig(data);
      setFetchAttempted(true); // Marquer que la tentative a été effectuée
      
    } catch (error) {
      console.error("Exception lors de la récupération de la configuration:", error);
      
      // Gestion détaillée des différents types d'erreurs
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      if (errorMsg.includes("Timeout")) {
        setEdgeFunctionError("Timeout: La requête à la fonction Edge a expiré. Le serveur ne répond pas.");
      } else if (errorMsg.includes("Failed to send") || errorMsg.includes("Failed to fetch")) {
        setEdgeFunctionError("Erreur de connexion: Impossible de contacter la fonction Edge. Vérifiez que la fonction est bien déployée.");
      } else {
        setEdgeFunctionError(`Erreur: ${errorMsg}`);
      }
      
      toast({
        title: "Erreur",
        description: `Impossible de récupérer la configuration: ${errorMsg}`,
        variant: "destructive"
      });

      setFetchAttempted(true); // Marquer que la tentative a été effectuée
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

  // Gérer l'état initial de chargement avec un rendu spécifique
  const showLoader = isLoading && !fetchAttempted;
  const showError = !isLoading && (!config || edgeFunctionError) && fetchAttempted;

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
        
        {edgeFunctionError && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur de connexion à la fonction Edge</AlertTitle>
            <AlertDescription>
              <p>{edgeFunctionError}</p>
              <p className="text-xs mt-2">Assurez-vous que :</p>
              <ul className="text-xs list-disc pl-4 mt-1 space-y-1">
                <li>La fonction Edge "pinecone-vectorize" est correctement déployée</li>
                <li>Vous n'avez pas de problème de connectivité réseau</li>
                <li>Vous n'êtes pas derrière un proxy ou pare-feu bloquant les requêtes</li>
                <li>Le service Supabase Functions est disponible (pas en maintenance)</li>
              </ul>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchConfig}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
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
        {showLoader ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">Chargement de la configuration...</p>
            </div>
          </div>
        ) : showError ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              {edgeFunctionError || "Impossible de charger la configuration. Cliquez sur 'Réessayer' pour une nouvelle tentative."}
            </p>
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PineconeSettings;
