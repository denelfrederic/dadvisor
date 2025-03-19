
import React from "react";
import { ChevronRight } from "lucide-react";

const TroubleshootingGuide = () => {
  return (
    <div className="bg-card rounded-lg p-6 border shadow-sm">
      <h2 className="text-lg font-medium mb-4">Aide au dépannage</h2>
      <ul className="space-y-3">
        <li className="flex items-start gap-2">
          <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
          <div>
            <strong>Erreur "non-2xx status code"</strong>
            <p className="text-sm text-muted-foreground">
              Cette erreur indique un problème de communication avec l'API Pinecone. Vérifiez que :
              <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                <li>L'environnement et l'index sont correctement configurés</li>
                <li>Votre clé API Pinecone est valide et n'a pas expiré</li>
                <li>L'index existe bien dans votre compte Pinecone</li>
              </ul>
            </p>
          </div>
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
          <div>
            <strong>Comment trouver mon environnement et index Pinecone</strong>
            <p className="text-sm text-muted-foreground">
              Connectez-vous à votre console Pinecone et notez :
              <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                <li>L'environnement est indiqué dans l'URL ou dans les paramètres du projet</li>
                <li>L'index est visible dans la liste des index de votre projet</li>
              </ul>
            </p>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default TroubleshootingGuide;
