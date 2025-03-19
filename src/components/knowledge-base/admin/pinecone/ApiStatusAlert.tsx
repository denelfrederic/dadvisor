
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ApiStatusAlertProps {
  error: string | null;
  missingKeys: string[];
}

const ApiStatusAlert = ({ error, missingKeys }: ApiStatusAlertProps) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-2">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Problème de configuration détecté</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{error}</p>
        {missingKeys.length > 0 && (
          <div>
            <p className="font-semibold mt-2">Clés API manquantes:</p>
            <ul className="list-disc pl-5">
              {missingKeys.map(key => (
                <li key={key}>{key}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm">
              Ajoutez ces clés API dans les secrets de votre projet Supabase.
            </p>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ApiStatusAlert;
