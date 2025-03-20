
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, Check, Copy, HelpCircle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PineconeUrlHelperProps {
  currentUrl?: string;
  onUrlUpdate?: (newUrl: string) => void;
}

/**
 * Assistant pour aider à formater et vérifier l'URL Pinecone
 */
const PineconeUrlHelper: React.FC<PineconeUrlHelperProps> = ({ currentUrl, onUrlUpdate }) => {
  const [urlInput, setUrlInput] = useState(currentUrl || "");
  const [validationResult, setValidationResult] = useState<{valid: boolean; message?: string}>({valid: false});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const validateUrl = () => {
    if (!urlInput.trim()) {
      setValidationResult({
        valid: false,
        message: "L'URL ne peut pas être vide"
      });
      return;
    }
    
    let formattedUrl = urlInput.trim();
    
    // Vérifier si l'URL commence par http:// ou https://
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
      setUrlInput(formattedUrl);
    }
    
    // Vérifier si l'URL contient pinecone.io
    if (!formattedUrl.includes('pinecone.io')) {
      setValidationResult({
        valid: false,
        message: "L'URL doit contenir 'pinecone.io'"
      });
      return;
    }
    
    // Vérifier si l'URL se termine par un slash
    if (!formattedUrl.endsWith('/')) {
      formattedUrl = formattedUrl + '/';
      setUrlInput(formattedUrl);
    }
    
    // Vérifier si c'est une URL serverless
    const isServerless = formattedUrl.includes('.aped-') || formattedUrl.includes('.serverless.');
    
    setValidationResult({
      valid: true,
      message: isServerless 
        ? "Votre URL est valide et utilise l'API serverless Pinecone" 
        : "Votre URL est valide et utilise l'API standard Pinecone"
    });
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(urlInput);
    toast({
      title: "URL copiée",
      description: "L'URL a été copiée dans le presse-papier"
    });
  };
  
  const saveUrlToSettings = async () => {
    setIsSaving(true);
    try {
      // Cette fonction est juste un exemple - dans une vraie application, 
      // il faudrait mettre à jour la configuration Pinecone
      // via une fonction edge Supabase
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { 
          action: 'update-config', 
          config: { 
            PINECONE_BASE_URL: urlInput 
          } 
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data && data.success) {
        toast({
          title: "Configuration mise à jour",
          description: "L'URL Pinecone a été mise à jour avec succès"
        });
        
        if (onUrlUpdate) {
          onUrlUpdate(urlInput);
        }
      } else {
        throw new Error(data?.message || "Échec de mise à jour de la configuration");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'URL:", error);
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour l'URL: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Assistant URL Pinecone</CardTitle>
        <CardDescription>
          Vérifiez et formatez correctement votre URL Pinecone
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Exemple: dadvisor-abc123.svc.aped-1234-5678.pinecone.io"
              className="font-mono text-xs"
            />
            <Button onClick={validateUrl} size="sm">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Format correct: https://votre-index.svc.aped-xxxx-xxxx.pinecone.io/
          </div>
        </div>
        
        {validationResult.message && (
          <Alert className={validationResult.valid ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}>
            <AlertDescription className="text-xs">
              {validationResult.message}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="bg-muted p-3 rounded-md space-y-2">
          <h3 className="text-xs font-medium">Comment trouver votre URL Pinecone:</h3>
          <ol className="list-decimal pl-5 text-xs space-y-1">
            <li>Connectez-vous à la <a href="https://app.pinecone.io" target="_blank" className="underline">console Pinecone</a></li>
            <li>Sélectionnez votre index dans la liste (probablement "dadvisor")</li>
            <li>Dans la page "API Reference", cherchez l'URL de l'endpoint</li>
            <li>L'URL sera au format: <code>https://your-index.svc.aped-xxxx-xxxx.pinecone.io/</code></li>
            <li>Copiez cette URL complète ici</li>
          </ol>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="text-xs"
            disabled={!validationResult.valid}
          >
            <Copy className="h-3 w-3 mr-2" />
            Copier
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={saveUrlToSettings}
            className="text-xs"
            disabled={!validationResult.valid || isSaving}
          >
            {isSaving ? (
              <>Enregistrement...</>
            ) : (
              <>
                <Save className="h-3 w-3 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => window.open('https://docs.pinecone.io/reference/urls', '_blank')}
        >
          <HelpCircle className="h-3 w-3 mr-2" />
          Aide
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PineconeUrlHelper;
