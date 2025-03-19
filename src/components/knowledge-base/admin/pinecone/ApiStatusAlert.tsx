
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";

interface ApiStatusAlertProps {
  error: string | null;
  missingKeys: string[];
}

const ApiStatusAlert = ({ error, missingKeys }: ApiStatusAlertProps) => {
  // Si aucune erreur n'est détectée, afficher un message de succès ou rien
  if (!error && missingKeys.length === 0) {
    return (
      <Alert className="mb-2 border-green-200 bg-green-50">
        <Info className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-700">Configuration valide</AlertTitle>
        <AlertDescription className="text-green-600">
          La connexion à Pinecone semble fonctionner correctement.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!error && missingKeys.length > 0) {
    return (
      <Alert variant="warning" className="mb-2">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Configuration incomplète</AlertTitle>
        <AlertDescription className="space-y-2">
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
  }
  
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
