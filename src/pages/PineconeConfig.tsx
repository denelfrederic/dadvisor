
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Settings, ChevronRight } from "lucide-react";
import PineconeConfigTester from "@/components/knowledge-base/admin/PineconeConfigTester";

const PineconeConfig = () => {
  return (
    <div className="min-h-screen bg-gradient-radial py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Button variant="outline" asChild>
            <Link to="/adminllm" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Retour à l'admin
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Configuration Pinecone</h1>
          </div>
          
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <h2 className="text-lg font-medium mb-4">Diagnostic de la configuration</h2>
            <p className="text-muted-foreground mb-6">
              Cet outil vous permet de vérifier que votre configuration Pinecone est correcte et 
              de diagnostiquer les problèmes de connexion.
            </p>
            
            <PineconeConfigTester />
          </div>
          
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <h2 className="text-lg font-medium mb-4">Paramètres actuels</h2>
            <p className="text-muted-foreground mb-3">
              Les paramètres de connexion à Pinecone sont configurés dans le fichier 
              <code className="bg-muted px-1 py-0.5 rounded mx-1">supabase/functions/pinecone-vectorize/index.ts</code>
            </p>
            
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                <span><strong>Environnement :</strong> Vérifiez la variable <code className="bg-muted px-1 py-0.5 rounded">PINECONE_ENVIRONMENT</code></span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                <span><strong>Index :</strong> Vérifiez la variable <code className="bg-muted px-1 py-0.5 rounded">PINECONE_INDEX</code></span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                <span><strong>URL :</strong> Générée automatiquement à partir des deux précédentes</span>
              </li>
            </ul>
            
            <div className="rounded-md bg-muted p-4 text-sm">
              <pre className="overflow-x-auto text-xs">
                {`const PINECONE_ENVIRONMENT = 'aped-4627-b74a'; // Votre environnement
const PINECONE_INDEX = 'dadvisor-3q5v9g1';   // Votre index
const PINECONE_BASE_URL = \`https://\${PINECONE_INDEX}.svc.\${PINECONE_ENVIRONMENT}.pinecone.io\`;`}
              </pre>
            </div>
          </div>
          
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
        </div>
      </div>
    </div>
  );
};

export default PineconeConfig;
