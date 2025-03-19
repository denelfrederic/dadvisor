
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

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        console.log("Vérification des clés API...");
        const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
          body: { action: 'check-keys' }
        });
        
        if (error) {
          console.error("Error checking API status:", error);
          setApiStatus({
            loading: false,
            error: `Erreur lors de la vérification des clés API: ${error.message}`,
            missingKeys: []
          });
          return;
        }
        
        console.log("Réponse reçue:", data);
        
        setApiStatus({
          loading: false,
          error: data?.error || null,
          missingKeys: data?.missingKeys || []
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("Failed to check API status:", errorMessage);
        
        setApiStatus({
          loading: false,
          error: `Erreur: ${errorMessage}`,
          missingKeys: []
        });
        
        toast({
          title: "Erreur de connexion",
          description: "Impossible de vérifier l'état de l'API Pinecone. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    };

    // Ajouter un timeout de sécurité pour éviter le blocage infini
    const timeoutId = setTimeout(() => {
      if (apiStatus.loading) {
        setApiStatus({
          loading: false,
          error: "Le délai d'attente a expiré. La fonction Edge peut être indisponible.",
          missingKeys: []
        });
        
        toast({
          title: "Délai d'attente expiré",
          description: "Vérifiez que la fonction Edge est correctement déployée.",
          variant: "destructive"
        });
      }
    }, 10000); // 10 secondes de timeout

    checkApiStatus();

    // Nettoyer le timeout si le composant est démonté
    return () => clearTimeout(timeoutId);
  }, [toast]);

  // Afficher un indicateur de chargement explicite
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
        </div>
      </div>
    </div>
  );
};

export default PineconeConfig;
