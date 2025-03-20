
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, ArrowRight, Check, RefreshCw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PineconeIndexSettingProps {
  currentIndex?: string;
  defaultIndex?: string;
  onIndexUpdate?: (newIndex: string) => void;
}

/**
 * Composant pour configurer l'index Pinecone
 */
const PineconeIndexSetting: React.FC<PineconeIndexSettingProps> = ({ 
  currentIndex, 
  defaultIndex = "dadvisor",
  onIndexUpdate 
}) => {
  const [indexInput, setIndexInput] = useState(currentIndex || defaultIndex || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success?: boolean; message?: string} | null>(null);
  const { toast } = useToast();

  const testIndex = async () => {
    if (!indexInput.trim()) {
      setTestResult({
        success: false,
        message: "L'index ne peut pas être vide"
      });
      return;
    }
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { 
          action: 'test-connection',
          indexName: indexInput.trim() 
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.success) {
        setTestResult({
          success: true,
          message: `Index '${indexInput.trim()}' trouvé et accessible`
        });
      } else {
        setTestResult({
          success: false,
          message: data.message || `Impossible d'accéder à l'index '${indexInput.trim()}'`
        });
      }
    } catch (error) {
      console.error("Erreur lors du test de l'index:", error);
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  const saveIndex = async () => {
    if (!indexInput.trim()) {
      toast({
        title: "Erreur",
        description: "L'index ne peut pas être vide",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { 
          action: 'update-config', 
          config: { 
            PINECONE_INDEX: indexInput.trim() 
          } 
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data && data.success) {
        toast({
          title: "Index mis à jour",
          description: `L'index Pinecone a été configuré sur '${indexInput.trim()}'`
        });
        
        if (onIndexUpdate) {
          onIndexUpdate(indexInput.trim());
        }
      } else {
        throw new Error(data?.message || "Échec de mise à jour de l'index");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'index:", error);
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour l'index: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Configuration de l'index Pinecone</CardTitle>
        <CardDescription>
          Définir l'index à utiliser pour les opérations Pinecone
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex gap-2">
            <Input
              value={indexInput}
              onChange={(e) => setIndexInput(e.target.value)}
              placeholder="Nom de l'index (ex: dadvisor)"
              className="text-xs"
            />
            <Button 
              onClick={testIndex} 
              size="sm" 
              variant="outline"
              disabled={isTesting}
            >
              {isTesting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
          
          {testResult && (
            <div className={`text-xs p-2 rounded-md flex items-center gap-2 ${
              testResult.success 
                ? "bg-green-50 text-green-700" 
                : "bg-red-50 text-red-700"
            }`}>
              {testResult.success 
                ? <Check className="h-3 w-3" /> 
                : <AlertCircle className="h-3 w-3" />}
              {testResult.message}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            L'index actif est: <span className="font-medium">{currentIndex || defaultIndex || "Non configuré"}</span>
            {currentIndex === defaultIndex && defaultIndex && (
              <span className="text-amber-600 ml-1">(valeur par défaut)</span>
            )}
          </div>
        </div>
        
        <div className="bg-muted p-3 rounded-md space-y-2">
          <h3 className="text-xs font-medium">À propos de la configuration de l'index</h3>
          <ul className="list-disc pl-5 text-xs space-y-1">
            <li>L'index doit correspondre exactement au nom de votre index dans la console Pinecone</li>
            <li>Le nom d'index incorrect est la cause la plus fréquente d'erreurs 404</li>
            <li>Pour les URLs de type "dadvisor-abc123.svc.aped-xxxx.pinecone.io", l'index est généralement "dadvisor"</li>
            <li>En cas de doute, vérifiez dans la console Pinecone</li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button
          onClick={saveIndex}
          disabled={isSaving}
          size="sm"
        >
          {isSaving ? (
            <>Enregistrement...</>
          ) : (
            <>
              <Save className="h-3 w-3 mr-2" />
              Enregistrer l'index
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PineconeIndexSetting;
