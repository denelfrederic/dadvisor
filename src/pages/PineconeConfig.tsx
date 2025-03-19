
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ProfileLoading from "@/components/profile/ProfileLoading";

// Import refactored components
import ApiStatusAlert from "@/components/knowledge-base/admin/pinecone/ApiStatusAlert";
import ConfigDiagnostic from "@/components/knowledge-base/admin/pinecone/ConfigDiagnostic";
import CurrentParameters from "@/components/knowledge-base/admin/pinecone/CurrentParameters";
import PineconePrerequisites from "@/components/knowledge-base/admin/pinecone/PineconePrerequisites";
import TroubleshootingGuide from "@/components/knowledge-base/admin/pinecone/TroubleshootingGuide";

const PineconeConfig = () => {
  const [apiStatus, setApiStatus] = useState<{
    loading: boolean;
    error: string | null;
    missingKeys: string[];
  }>({
    loading: true,
    error: null,
    missingKeys: []
  });
  const { toast } = useToast();

  // Version synchronisée de la vérification de l'état pour déblocage forcé
  const forceCheckStatus = async () => {
    setApiStatus(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Tentative d'appel à la fonction Edge
      console.log("Tentative de connexion à la fonction Edge...");
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { action: 'check-keys' }
      });
      
      console.log("Réponse reçue de la fonction Edge:", { data, error });
      
      if (error) {
        console.error("Erreur lors de l'appel à la fonction Edge:", error);
        setApiStatus({
          loading: false,
          error: `Erreur lors de l'appel à la fonction Edge: ${error.message}`,
          missingKeys: []
        });
        
        toast({
          title: "Erreur d'API",
          description: `Problème avec la fonction Edge: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      // Vérifier si la réponse contient les données attendues
      if (!data) {
        console.error("Réponse vide de la fonction Edge");
        setApiStatus({
          loading: false,
          error: "La fonction Edge a retourné une réponse vide",
          missingKeys: []
        });
        return;
      }
      
      setApiStatus({
        loading: false,
        error: data?.error || null,
        missingKeys: data?.missingKeys || []
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Échec de la vérification du statut API:", errorMessage);
      
      setApiStatus({
        loading: false,
        error: `Erreur de connexion: ${errorMessage}`,
        missingKeys: []
      });
      
      toast({
        title: "Erreur de connexion",
        description: "Impossible de communiquer avec la fonction Edge. Vérifiez les logs Supabase.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    console.log("Composant PineconeConfig monté");
    
    // Ajouter un timeout de sécurité pour éviter le blocage infini
    const timeoutId = setTimeout(() => {
      if (apiStatus.loading) {
        console.log("Timeout déclenché - déblocage forcé");
        setApiStatus({
          loading: false,
          error: "Le délai d'attente a expiré. La fonction Edge peut être indisponible.",
          missingKeys: []
        });
        
        toast({
          title: "Délai d'attente expiré",
          description: "Vérifiez que la fonction Edge est correctement déployée dans la console Supabase.",
          variant: "destructive"
        });
      }
    }, 5000); // Réduit à 5 secondes pour un déblocage plus rapide

    // Lancer la vérification de statut
    forceCheckStatus();

    // Nettoyer le timeout si le composant est démonté
    return () => {
      console.log("Nettoyage du composant PineconeConfig");
      clearTimeout(timeoutId);
    };
  }, [toast]);

  // Afficher un indicateur de chargement explicite avec bouton de déblocage
  if (apiStatus.loading) {
    return (
      <div className="min-h-screen bg-gradient-radial py-10 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Button variant="outline" asChild>
              <Link to="/adminllm" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Retour à l'admin
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Configuration Pinecone</h1>
            </div>
            
            <div className="bg-card rounded-lg p-6 border shadow-sm text-center">
              <ProfileLoading />
              <p className="mt-4 text-muted-foreground">Vérification de la configuration Pinecone...</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  console.log("Annulation du chargement et affichage forcé");
                  setApiStatus(prev => ({...prev, loading: false}));
                }}
              >
                Forcer l'affichage
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-radial py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Button variant="outline" asChild>
            <Link to="/adminllm" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Retour à l'admin
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Configuration Pinecone</h1>
          </div>
          
          <ApiStatusAlert error={apiStatus.error} missingKeys={apiStatus.missingKeys} />
          
          <ConfigDiagnostic isLoading={false} />
          
          <CurrentParameters />
          
          <PineconePrerequisites />
          
          <TroubleshootingGuide />
          
          <div className="flex justify-end mt-4">
            <Button 
              onClick={forceCheckStatus}
              variant="outline"
              className="flex items-center gap-2"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.6868 22 9.38647 21.7357 8.17317 21.2541" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L5 15M2 12L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Actualiser le statut
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PineconeConfig;
