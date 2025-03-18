
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertTriangle, Code } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface SearchResultsProps {
  query: string;
  response: string;
  sources: string[];
  isLoading: boolean;
  debugLogs?: string[];
}

const SearchResults = ({
  query,
  response,
  sources,
  isLoading,
  debugLogs = []
}: SearchResultsProps) => {
  const [activeTab, setActiveTab] = useState<string>("response");
  const [showDebug, setShowDebug] = useState(false);
  
  // Reset to response tab when a new search is performed
  useEffect(() => {
    if (isLoading) {
      setActiveTab("response");
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Recherche en cours...</p>
      </div>
    );
  }

  if (!response && !isLoading) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="response">Réponse</TabsTrigger>
            {sources.length > 0 && (
              <TabsTrigger value="sources">
                Sources{" "}
                <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {sources.length}
                </span>
              </TabsTrigger>
            )}
            {debugLogs.length > 0 && (
              <TabsTrigger value="debug">
                Debug
              </TabsTrigger>
            )}
          </TabsList>
          
          {debugLogs.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs"
            >
              <Code className="h-3 w-3 mr-1" />
              {showDebug ? "Masquer logs" : "Afficher logs"}
            </Button>
          )}
        </div>

        <TabsContent value="response" className="mt-4">
          {showDebug && debugLogs.length > 0 && (
            <Card className="mb-4 p-2 bg-slate-50 border-slate-200">
              <ScrollArea className="h-32 text-xs font-mono">
                {debugLogs.map((log, i) => (
                  <div key={i} className="px-2 py-0.5">
                    {log}
                  </div>
                ))}
              </ScrollArea>
            </Card>
          )}
          
          <Card className="p-4">
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold mb-2">
                Réponse à votre question : {query}
              </h3>
              <div className="whitespace-pre-wrap">{response}</div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="mt-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Sources utilisées</h3>
            {sources.length > 0 ? (
              <div className="space-y-3">
                {sources.map((source, index) => (
                  <div key={index} className="border rounded-md p-3 text-sm">
                    <div className="flex gap-2 items-start">
                      <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                        {index + 1}
                      </span>
                      <div>{source}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Aucune source n'a été utilisée pour cette réponse.
                </AlertDescription>
              </Alert>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="debug" className="mt-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Logs de débogage</h3>
            <ScrollArea className="h-[400px] border rounded bg-black/90 text-white p-4 font-mono">
              {debugLogs.length > 0 ? (
                <div className="space-y-1 text-xs">
                  {debugLogs.map((log, i) => (
                    <div key={i} className="whitespace-pre-wrap">
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">Aucun log disponible</p>
                </div>
              )}
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchResults;
