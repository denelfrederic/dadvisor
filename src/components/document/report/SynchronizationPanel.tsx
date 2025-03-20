
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { usePineconeSynchronizer } from "../detail/hooks/usePineconeSynchronizer";
import { useIsMobile } from "@/hooks/use-mobile";

interface SynchronizationPanelProps {
  onComplete?: () => void;
}

/**
 * Panneau pour synchroniser les documents déjà présents dans Pinecone
 * mais non marqués comme tels dans la base de données
 */
const SynchronizationPanel: React.FC<SynchronizationPanelProps> = ({ onComplete }) => {
  const { isSynchronizing, synchronizeAllDocuments } = usePineconeSynchronizer();
  const [lastResult, setLastResult] = useState<{ success: boolean; count: number } | null>(null);
  const isMobile = useIsMobile();

  const handleSynchronize = async () => {
    const result = await synchronizeAllDocuments();
    setLastResult(result);
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <RefreshCw className="h-4 w-4 mr-2" />
          Synchronisation des documents
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Marquer comme indexés dans Pinecone les documents qui ont déjà un embedding
        </CardDescription>
      </CardHeader>
      
      <CardContent className="text-xs md:text-sm">
        <p>
          Cette action mettra à jour les documents qui ont un embedding mais ne sont pas marqués comme indexés dans Pinecone. 
          Cela peut arriver suite à une perte de synchronisation entre la base de données et Pinecone.
        </p>
        
        {lastResult && (
          <div className={`mt-3 p-2 rounded-md ${lastResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {lastResult.success 
              ? `${lastResult.count} document(s) synchronisé(s) avec succès.` 
              : "Erreur lors de la synchronisation."}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={handleSynchronize} 
          disabled={isSynchronizing}
          variant="outline"
          className="border-amber-300 bg-amber-100 hover:bg-amber-200 w-full sm:w-auto"
        >
          {isSynchronizing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span className="truncate">Synchronisation...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="truncate">Synchroniser</span>
            </>
          )}
        </Button>
        
        {lastResult && (
          <Button
            onClick={() => setLastResult(null)}
            variant="ghost"
            size="sm"
            className="ml-0 sm:ml-2 w-full sm:w-auto"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            <span className="truncate">Effacer le résultat</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SynchronizationPanel;
