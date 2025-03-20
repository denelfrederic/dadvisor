
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PineconeQueryTester = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setError(null);
    setSearchResults(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('pinecone-vectorize', {
        body: {
          action: 'query',
          query: query.trim(),
          topK: 5
        }
      });
      
      if (error) {
        throw new Error(`Erreur d'invocation: ${error.message}`);
      }
      
      setSearchResults(data);
    } catch (err) {
      console.error("Erreur lors de la recherche:", err);
      setError(err instanceof Error ? err.message : "Une erreur s'est produite lors de la recherche.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-medium">Testeur de requête Pinecone</h3>
      </div>
      
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Entrez une requête de test..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button 
          onClick={handleSearch} 
          disabled={isSearching || !query.trim()}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          <p className="font-medium">Erreur de recherche</p>
          <p>{error}</p>
        </div>
      )}
      
      {searchResults && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Résultats ({searchResults.results?.length || 0})</h4>
            <span className="text-xs text-muted-foreground">
              Index: {searchResults.pineconeIndex || 'Non spécifié'}, 
              Namespace: {searchResults.namespace || 'documents'}
            </span>
          </div>
          
          {searchResults.results?.length === 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Aucun résultat trouvé</p>
                <p className="text-xs text-amber-700">
                  Raisons possibles :
                </p>
                <ul className="text-xs text-amber-700 list-disc ml-4 mt-1">
                  <li>Aucun document n'est indexé dans Pinecone</li>
                  <li>Les documents indexés ne correspondent pas à la requête</li>
                  <li>L'index ou le namespace est incorrect</li>
                  <li>Problème avec la connexion à Pinecone</li>
                </ul>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-60 border rounded-md p-2">
              {searchResults.results?.map((result: any, index: number) => (
                <div key={index} className="p-2 border-b last:border-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium">ID: {result.id}</span>
                    <span className="text-xs">Score: {(result.score * 100).toFixed(2)}%</span>
                  </div>
                  {result.metadata?.title && (
                    <p className="text-sm">{result.metadata.title}</p>
                  )}
                  {result.metadata?.text && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {result.metadata.text}
                    </p>
                  )}
                </div>
              ))}
            </ScrollArea>
          )}
          
          <div className="mt-2 text-xs text-muted-foreground">
            Requête exécutée le {new Date(searchResults.timestamp).toLocaleString()}
          </div>
        </Card>
      )}
      
      <div className="text-xs text-muted-foreground">
        <p>
          Cette fonction permet de tester directement les requêtes vers Pinecone pour vérifier
          si vos documents sont correctement indexés. Si aucun résultat n'apparaît, vérifiez
          la configuration Pinecone et l'état d'indexation de vos documents.
        </p>
      </div>
    </div>
  );
};

export default PineconeQueryTester;
