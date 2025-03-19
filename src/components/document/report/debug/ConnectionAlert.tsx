
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConnectionAlertProps {
  connectionTest: any;
}

const ConnectionAlert: React.FC<ConnectionAlertProps> = ({ connectionTest }) => {
  if (!connectionTest || connectionTest.success) return null;
  
  const openPineconeConsole = () => {
    window.open("https://app.pinecone.io", "_blank");
  };
  
  const is404Error = connectionTest.status === 404 || connectionTest.message?.includes("404");
  const is403Error = connectionTest.status === 403 || connectionTest.message?.includes("403");
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Échec du test de connexion</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{connectionTest.message || "Impossible de se connecter à Pinecone"}</p>
        
        {is404Error && (
          <div className="mt-2 text-sm border-l-2 border-red-500 pl-2">
            <p className="font-medium">Erreur 404 - URL ou index non trouvé:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
              <li>Vérifiez que l'URL de votre index est correcte</li>
              <li>Assurez-vous que l'index existe dans votre compte Pinecone</li>
              <li>Récupérez l'URL correcte depuis la console Pinecone</li>
            </ul>
          </div>
        )}
        
        {is403Error && (
          <div className="mt-2 text-sm border-l-2 border-orange-500 pl-2">
            <p className="font-medium">Erreur 403 - Accès refusé:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
              <li>Vérifiez que votre clé API est correcte</li>
              <li>Les plans gratuits se mettent en pause après 1h d'inactivité</li>
              <li>Allez sur la console Pinecone pour réactiver votre index</li>
            </ul>
          </div>
        )}
        
        {connectionTest.testedUrls && (
          <div className="mt-2 text-xs">
            <p><strong>URLs testées:</strong></p>
            <div className="font-mono text-xs mt-1 max-h-20 overflow-y-auto">
              {connectionTest.testedUrls.map((url: string, i: number) => (
                <div key={i} className="truncate">{url}</div>
              ))}
            </div>
          </div>
        )}
        
        {connectionTest.error && (
          <div className="mt-2 text-xs overflow-x-auto">
            <strong>Détails de l'erreur:</strong> {connectionTest.error}
          </div>
        )}
        
        {connectionTest.status && (
          <div className="mt-2 text-xs">
            <strong>Code HTTP:</strong> {connectionTest.status}
          </div>
        )}
        
        <div className="mt-3">
          <Button 
            size="sm" 
            onClick={openPineconeConsole}
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Ouvrir la console Pinecone
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionAlert;
