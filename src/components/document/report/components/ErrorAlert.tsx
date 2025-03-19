
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
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
  
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erreur d'indexation</AlertTitle>
      <AlertDescription className="text-sm whitespace-pre-wrap space-y-2">
        <p>{errorSummary}</p>
        
        {errorSummary.includes("API") && (
          <div className="mt-2 text-xs">
            <p><strong>Solutions possibles :</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              {errorSummary.includes("OpenAI") && (
                <li>Vérifiez que la clé API OpenAI est correctement configurée dans les secrets Supabase.</li>
              )}
              {errorSummary.includes("Pinecone") && (
                <li>Vérifiez que la clé API Pinecone est correctement configurée dans les secrets Supabase.</li>
              )}
              <li>Vérifiez les paramètres d'index Pinecone (environment, index name).</li>
              <li>Consultez les logs ci-dessous pour plus de détails.</li>
            </ul>
          </div>
        )}
        
        {(errorSummary.includes("403") || errorSummary.includes("Forbidden")) && (
          <div className="mt-2 text-xs">
            <p><strong>Erreur d'autorisation (403 Forbidden):</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Vérifiez que la clé API Pinecone est correctement configurée et valide.</li>
              <li>Vérifiez que l'index Pinecone configuré existe bien dans votre compte.</li>
              <li>Vérifiez que votre clé API a les droits suffisants pour accéder à cet index.</li>
            </ul>
          </div>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
