
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TestConnectionButtonProps {
  onTestComplete: (result: any) => void;
  isLoading?: boolean;
}

const TestConnectionButton: React.FC<TestConnectionButtonProps> = ({ 
  onTestComplete,
  isLoading: externalLoading = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const testConnection = async () => {
    setIsLoading(true);
    try {
      toast({
        title: "Test de connexion",
        description: "Vérification de la connexion à Pinecone en cours..."
      });
      
      // Ajouter un hook de détection de timeout
      const TIMEOUT = 10000; // 10 secondes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
      
      // Version compatible avec les types existants
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { action: 'test-connection' }
        // Nous n'utilisons pas signal ici pour maintenir la compatibilité avec les types existants
      });
      
      // Annuler le timeout manuellement
      clearTimeout(timeoutId);
      
      // Vérifier si la requête a été annulée manuellement
      if (controller.signal.aborted) {
        const timeoutMessage = "La requête a expiré après 10 secondes. Le serveur ne répond pas.";
        console.error("Timeout de la requête:", timeoutMessage);
        
        toast({
          title: "Échec du test",
          description: timeoutMessage,
          variant: "destructive"
        });
        
        onTestComplete({
          success: false,
          error: "Request timeout after 10 seconds",
          status: 408,
          message: timeoutMessage,
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      if (error) {
        const errorMessage = `Erreur de connexion: ${error.message || "Erreur inconnue"}`;
        console.error(errorMessage);
        
        toast({
          title: "Échec du test",
          description: error.message.includes("aborted") 
            ? "La requête a expiré après 10 secondes. Le serveur ne répond pas." 
            : errorMessage,
          variant: "destructive"
        });
        
        onTestComplete({
          success: false,
          error: error.message,
          status: 500,
          message: errorMessage,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log("Résultat du test de connexion:", data);
        
        if (data?.success) {
          toast({
            title: "Connexion réussie",
            description: "La connexion à Pinecone fonctionne correctement"
          });
        } else {
          toast({
            title: "Échec de connexion",
            description: data?.message || "Impossible de se connecter à Pinecone",
            variant: "destructive"
          });
        }
        
        onTestComplete(data);
      }
    } catch (err) {
      console.error("Erreur lors du test de connexion:", err);
      
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      toast({
        title: "Erreur",
        description: `Une erreur s'est produite lors du test: ${errorMessage}`,
        variant: "destructive"
      });
      
      onTestComplete({
        success: false,
        error: errorMessage,
        message: "Erreur lors du test de connexion",
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={testConnection}
      disabled={isLoading || externalLoading}
      className="flex items-center gap-1"
    >
      {isLoading || externalLoading ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Test en cours...
        </>
      ) : (
        <>
          <RefreshCw className="h-3 w-3" />
          Tester la connexion
        </>
      )}
    </Button>
  );
};

export default TestConnectionButton;
