
import React from "react";
import { AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/**
 * Composant affichant des suggestions de dépannage pour les problèmes de connexion Pinecone
 */
const TestSuggestions: React.FC = () => {
  const { toast } = useToast();

  const showDiagnosticInfo = () => {
    toast({
      title: "Informations de diagnostic",
      description: "La console affiche maintenant des informations de diagnostic avancées. Vérifiez la console du navigateur (F12).",
    });
    
    console.info("=== DIAGNOSTIC PINECONE ===");
    console.info("1. Vérifiez que le service Pinecone est opérationnel: https://status.pinecone.io/");
    console.info("2. Assurez-vous que les variables d'environnement sont correctement configurées dans Supabase");
    console.info("3. La fonction edge pinecone-vectorize est-elle correctement déployée ?");
    console.info("4. Y a-t-il des restrictions CORS sur votre réseau ?");
    console.info("5. L'API Pinecone est-elle accessible depuis l'environnement Supabase Edge Functions ?");
  };

  return (
    <div className="space-y-4 mt-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Problème de connexion détecté</AlertTitle>
        <AlertDescription>
          Impossible de se connecter à la fonction edge pinecone-vectorize. 
          Cette fonction est nécessaire pour interagir avec l'index Pinecone.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Suggestions de dépannage :</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Vérifiez que la fonction edge <code>pinecone-vectorize</code> est correctement déployée</li>
          <li>Assurez-vous que les variables d'environnement <code>PINECONE_API_KEY</code> et <code>PINECONE_BASE_URL</code> sont définies</li>
          <li>Vérifiez l'état du service Pinecone sur leur page de statut</li>
          <li>Essayez de rafraîchir la page et réessayer</li>
        </ul>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={showDiagnosticInfo}
        className="flex items-center gap-2"
      >
        <Info className="h-4 w-4" />
        Afficher les infos de diagnostic
      </Button>
      
      <p className="text-xs text-muted-foreground">
        Si le problème persiste après plusieurs tentatives, contactez l'administrateur système.
      </p>
    </div>
  );
};

export default TestSuggestions;
