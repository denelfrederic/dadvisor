
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Settings, ChevronRight, AlertTriangle } from "lucide-react";
import PineconeConfigTester from "@/components/knowledge-base/admin/PineconeConfigTester";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const PineconeConfig = () => {
  const [apiStatus, setApiStatus] = useState<{
    loading: boolean;
    error: string | null;
    missingKeys: string[];
  }>({
    loading: true,
    error: null,
    missingKeys: []
  });
  const { toast } = useToast();

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
          body: { action: 'check-keys' }
        });
        
        if (error) {
          console.error("Error checking API status:", error);
          setApiStatus({
            loading: false,
            error: `Erreur lors de la vérification des clés API: ${error.message}`,
            missingKeys: []
          });
          return;
        }
        
        setApiStatus({
          loading: false,
          error: data.error || null,
          missingKeys: data.missingKeys || []
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("Failed to check API status:", errorMessage);
        
        // Check if we got an HTML response, which indicates the Edge function failed
        if (errorMessage.includes("<") && errorMessage.includes(">")) {
          setApiStatus({
            loading: false,
            error: "La fonction Edge a échoué. Vérifiez les logs dans la console Supabase.",
            missingKeys: ["OPENAI_API_KEY", "PINECONE_API_KEY"]
          });
        } else {
          setApiStatus({
            loading: false,
            error: `Erreur: ${errorMessage}`,
            missingKeys: []
          });
        }
      }
    };

    checkApiStatus();
  }, []);

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
          
          {apiStatus.error && (
            <Alert variant="destructive" className="mb-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Problème de configuration détecté</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{apiStatus.error}</p>
                {apiStatus.missingKeys.length > 0 && (
                  <div>
                    <p className="font-semibold mt-2">Clés API manquantes:</p>
                    <ul className="list-disc pl-5">
                      {apiStatus.missingKeys.map(key => (
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
          )}
          
          <div className="bg-card rounded-lg p-6 border shadow-sm">
            <h2 className="text-lg font-medium mb-4">Diagnostic de la configuration</h2>
            <p className="text-muted-foreground mb-6">
              Cet outil vous permet de vérifier que votre configuration Pinecone est correcte et 
              de diagnostiquer les problèmes de connexion.
            </p>
            
            {apiStatus.loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <PineconeConfigTester />
            )}
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
            <h2 className="text-lg font-medium mb-4">Prérequis pour Pinecone</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
                <div>
                  <strong>1. Créer votre compte Pinecone</strong>
                  <p className="text-sm text-muted-foreground">
                    Créez un compte sur <a href="https://www.pinecone.io/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">pinecone.io</a>
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
                <div>
                  <strong>2. Obtenir votre clé API</strong>
                  <p className="text-sm text-muted-foreground">
                    Dans le tableau de bord Pinecone, allez dans les paramètres API Keys et copiez votre clé API
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
                <div>
                  <strong>3. Configurer les secrets dans Supabase</strong>
                  <p className="text-sm text-muted-foreground">
                    Dans la console Supabase, allez dans les paramètres des Edge Functions et ajoutez 
                    la clé <code className="bg-muted px-1 py-0.5 rounded">PINECONE_API_KEY</code> avec 
                    votre valeur de clé API
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
                <div>
                  <strong>4. Configurer la clé OpenAI</strong>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez également la clé <code className="bg-muted px-1 py-0.5 rounded">OPENAI_API_KEY</code> dans 
                    les secrets Supabase, nécessaire pour générer les embeddings
                  </p>
                </div>
              </li>
            </ul>
            
            <div className="mt-6 p-4 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-medium">Attention</p>
                  <p className="text-sm mt-1">
                    Les clés API manquantes ou incorrectes sont la principale cause des problèmes de connexion 
                    à Pinecone. Assurez-vous de configurer correctement vos clés dans les secrets Supabase.
                  </p>
                </div>
              </div>
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
