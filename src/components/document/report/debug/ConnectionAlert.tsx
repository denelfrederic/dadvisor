
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ConnectionAlertProps {
  connectionTest: any;
}

const ConnectionAlert: React.FC<ConnectionAlertProps> = ({ connectionTest }) => {
  if (!connectionTest || connectionTest.success) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Échec du test</AlertTitle>
      <AlertDescription>
        {connectionTest.message || "Impossible de se connecter à Pinecone"}
        {connectionTest.error && (
          <div className="mt-2 text-xs">
            <strong>Détails de l'erreur:</strong> {connectionTest.error}
          </div>
        )}
        {connectionTest.details && (
          <div className="mt-2 text-xs">
            <strong>Réponse du serveur:</strong> {connectionTest.details}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionAlert;
