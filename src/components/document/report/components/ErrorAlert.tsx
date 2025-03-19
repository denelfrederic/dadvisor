
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Settings, Key } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorAlertProps {
  errorSummary: string | null;
  onRetry: () => void;
}

/**
 * Composant qui affiche les erreurs d'indexation avec des solutions possibles
 */
const ErrorAlert: React.FC<ErrorAlertProps> = ({ errorSummary, onRetry }) => {
  if (!errorSummary) return null;
  
  // Fonction pour déterminer le type d'erreur et les solutions appropriées
  const getErrorDetails = () => {
    // Erreur d'autorisation Pinecone (403)
    if (errorSummary.includes("403") || errorSummary.includes("Forbidden")) {
      return {
        title: "Erreur d'autorisation Pinecone (403 Forbidden)",
        solutions: [
          "Vérifiez que la clé API Pinecone est correctement configurée dans les secrets Supabase",
          "Vérifiez que l'index Pinecone configuré existe bien dans votre compte",
          "Assurez-vous que votre clé API a les droits suffisants pour accéder à cet index",
          "Vérifiez si vous avez atteint les limites de quota de votre compte Pinecone"
        ]
      };
    }
    
    // Erreur d'API OpenAI
    if (errorSummary.includes("OpenAI")) {
      return {
        title: "Erreur d'API OpenAI",
        solutions: [
          "Vérifiez que la clé API OpenAI est correctement configurée dans les secrets Supabase",
          "Assurez-vous que votre compte OpenAI dispose de crédits suffisants",
          "Vérifiez que vous utilisez un modèle compatible avec les embeddings (ada-002)"
        ]
      };
    }
    
    // Erreur Edge Function
    if (errorSummary.includes("Edge Function") || errorSummary.includes("non-2xx status code")) {
      return {
        title: "Erreur de la fonction Edge",
        solutions: [
          "Une erreur s'est produite dans la fonction Supabase qui communique avec Pinecone",
          "Vérifiez les variables d'environnement PINECONE_API_KEY et PINECONE_BASE_URL dans la console Supabase",
          "Assurez-vous que la configuration de l'index Pinecone est correcte (PINECONE_INDEX)"
        ]
      };
    }
    
    // Erreur générique
    return {
      title: "Erreur d'indexation",
      solutions: [
        "Vérifiez la configuration des APIs externes (Pinecone, OpenAI)",
        "Consultez les logs pour plus de détails",
        "Essayez d'indexer un document plus court ou avec moins de contenu"
      ]
    };
  };
  
  const errorDetails = getErrorDetails();
  
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{errorDetails.title}</AlertTitle>
      <AlertDescription className="text-sm whitespace-pre-wrap space-y-2">
        <p>{errorSummary}</p>
        
        <div className="mt-3 text-xs bg-destructive/10 p-3 rounded">
          <p className="font-semibold mb-1">Solutions possibles :</p>
          <ul className="list-disc pl-5 space-y-1.5">
            {errorDetails.solutions.map((solution, index) => (
              <li key={index}>{solution}</li>
            ))}
          </ul>
          
          {errorSummary.includes("403") && (
            <div className="mt-3 pt-2 border-t border-destructive/20">
              <p className="font-semibold mb-1">Informations sur les quotas :</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Les plans gratuits de Pinecone ont des limites strictes sur le nombre de requêtes</li>
                <li>Vérifiez si vous avez dépassé votre quota mensuel dans la console Pinecone</li>
                <li>Si nécessaire, envisagez de passer à un plan supérieur ou d'attendre le renouvellement du quota</li>
              </ul>
            </div>
          )}
          
          {errorSummary.includes("Pinecone") && (
            <div className="mt-3 pt-2 border-t border-destructive/20">
              <p className="font-semibold mb-1">Actions recommandées :</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Vérifiez que la clé API Pinecone est valide et active</li>
                <li>Vérifiez l'orthographe exacte de l'index Pinecone dans la configuration</li>
                <li>Consultez les logs détaillés ci-dessous pour le message d'erreur précis</li>
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/settings', '_blank')}
            className="mt-2"
          >
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://console.pinecone.io', '_blank')}
            className="mt-2"
          >
            <Key className="h-4 w-4 mr-2" />
            Console Pinecone
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
