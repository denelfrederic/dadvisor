
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Bug, Wrench } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DebugInfoProps {
  onGetInfo: () => void;
}

const DebugInfo: React.FC<DebugInfoProps> = ({ onGetInfo }) => {
  const [diagnosticInfo, setDiagnosticInfo] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const getPineconeConfig = async () => {
    setIsLoading(true);
    try {
      toast({
        title: "Récupération des informations de diagnostic",
        description: "Vérification de la configuration Pinecone en cours..."
      });
      
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: { action: 'config' }
      });
      
      if (error) {
        toast({
          title: "Erreur",
          description: `Échec de la récupération des informations: ${error.message}`,
          variant: "destructive"
        });
        setDiagnosticInfo({ error: error.message });
        return;
      }
      
      setDiagnosticInfo(data);
      toast({
        title: "Succès",
        description: "Informations de diagnostic récupérées avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Exception: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Diagnostic Pinecone
        </h3>
        <div className="flex gap-2">
          <Button 
            onClick={getPineconeConfig} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <Wrench className="h-4 w-4 mr-2" />
            Vérifier config
          </Button>
        </div>
      </div>
      
      {diagnosticInfo && (
        <ScrollArea className="h-[200px] border rounded-md p-2 bg-black/90 text-white font-mono">
          <div className="space-y-1 text-xs">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(diagnosticInfo, null, 2)}
            </pre>
          </div>
        </ScrollArea>
      )}
      
      {!diagnosticInfo && (
        <div className="flex flex-col items-center justify-center h-20 text-center p-4 text-gray-400 border rounded-md">
          <p className="text-sm">Cliquez sur "Vérifier config" pour diagnostiquer la connexion Pinecone</p>
        </div>
      )}
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>Utilisez cet outil pour vérifier la configuration de connexion à Pinecone et diagnostiquer les problèmes d'indexation.</p>
      </div>
    </Card>
  );
};

export default DebugInfo;
