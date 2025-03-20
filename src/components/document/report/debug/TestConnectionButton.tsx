
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
      
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { action: 'test-connection' },
        signal: controller.signal
      });
      
      // Annuler le timeout si la requête a réussi
      clearTimeout(timeoutId);
      
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
