
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeEntry } from "./types";
import { useKnowledgeBaseService } from "./services";
import { sendMessageToGemini } from "../chat/services";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Database, ArrowRight, Globe, BookOpen, Loader2 } from "lucide-react";

const KnowledgeSearch = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("internet");
  const [includeLocalContent, setIncludeLocalContent] = useState(false);
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
  const { toast } = useToast();
  const kb = useKnowledgeBaseService();

  useEffect(() => {
    // Load knowledge entries when component mounts
    const loadEntries = async () => {
      const entries = await kb.getEntries();
      setKnowledgeEntries(entries);
    };
    
    loadEntries();
  }, []);

  const handleInternetSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Question vide",
        description: "Veuillez entrer une question pour effectuer une recherche.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setResponse("");
    setSources([]);
    
    try {
      let context = "";
      let usedSources: string[] = [];
      
      // Si l'option est activée, inclure également le contenu local
      if (includeLocalContent) {
        const searchResults = await kb.searchEntries(query);
        
        if (searchResults.length > 0) {
          context = searchResults
            .map(entry => `Q: ${entry.question}\nA: ${entry.answer}`)
            .join('\n\n');
          
          usedSources = searchResults.map(entry => 
            `Base de connaissances: ${entry.question.substring(0, 50)}${entry.question.length > 50 ? '...' : ''}`
          );
          
          console.log("Contenu local inclus dans la recherche Internet:", searchResults.length, "entrées");
        }
      }
      
      // Utiliser Gemini pour la recherche Internet, avec ou sans contexte local
      const result = await sendMessageToGemini(
        query, 
        [], 
        includeLocalContent, 
        includeLocalContent ? context : ""
      );
      
      setResponse(result);
      setSources([...usedSources, "Recherche Internet via Gemini"]);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocalSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Question vide",
        description: "Veuillez entrer une question pour la recherche locale.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setResponse("");
    setSources([]);
    
    try {
      // Rechercher dans la base de connaissances locale
      const searchResults = await kb.searchEntries(query);
      let usedSources: string[] = [];
      
      if (searchResults.length > 0) {
        // Utiliser les résultats de la recherche comme contexte pour Gemini
        const context = searchResults
          .map(entry => `Q: ${entry.question}\nA: ${entry.answer}`)
          .join('\n\n');
        
        usedSources = searchResults.map(entry => 
          `Base de connaissances: ${entry.question.substring(0, 50)}${entry.question.length > 50 ? '...' : ''}`
        );
        
        const result = await sendMessageToGemini(query, [], true, context);
        setResponse(result);
        setSources([...usedSources, "Augmenté par Gemini"]);
      } else {
        // Aucun résultat trouvé, utiliser Gemini sans contexte
        const result = await sendMessageToGemini(
          query, 
          [], 
          true, 
          "Aucune information pertinente trouvée dans la base de connaissances locale."
        );
        setResponse(result);
        setSources(["Aucune information pertinente dans la base locale", "Réponse fournie par Gemini"]);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    if (activeTab === "internet") {
      handleInternetSearch();
    } else {
      handleLocalSearch();
    }
  };

  return (
    <div>
      <Tabs defaultValue="internet" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="internet" className="flex items-center gap-2">
            <Globe size={16} />
            Recherche Internet
          </TabsTrigger>
          <TabsTrigger value="local" className="flex items-center gap-2">
            <BookOpen size={16} />
            Base Locale + Gemini
          </TabsTrigger>
        </TabsList>
        
        <div className="space-y-4">
          <Textarea 
            placeholder="Posez votre question financière..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[100px]"
          />
          
          {activeTab === "internet" && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeLocal" 
                checked={includeLocalContent}
                onCheckedChange={(checked) => setIncludeLocalContent(checked as boolean)}
              />
              <Label htmlFor="includeLocal" className="text-sm cursor-pointer">
                Inclure également le contenu de la base de connaissances locale
              </Label>
            </div>
          )}
          
          <Button 
            onClick={handleSearch} 
            disabled={isSearching || !query.trim()}
            className="w-full"
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recherche en cours...
              </>
            ) : (
              <>
                {activeTab === "internet" 
                  ? includeLocalContent
                    ? "Rechercher sur Internet avec contenu local" 
                    : "Rechercher sur Internet uniquement"
                  : "Lancer recherche dans la Base Locale et augmenter avec Gemini"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </Tabs>
      
      {response && (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-lg bg-muted">
            <h4 className="font-medium mb-2">Réponse:</h4>
            <p className="text-sm whitespace-pre-line">{response}</p>
          </div>
          
          {sources.length > 0 && (
            <div className="p-4 rounded-lg border border-muted">
              <h4 className="font-medium mb-2 text-sm text-muted-foreground">Sources:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                {sources.map((source, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{source}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeSearch;
