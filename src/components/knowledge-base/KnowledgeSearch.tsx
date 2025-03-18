
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeEntry } from "./types";
import { useKnowledgeBaseService } from "./knowledgeBaseService";
import { sendMessageToGemini } from "../chat/services";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Database, ArrowRight } from "lucide-react";
import { Loader2 } from "lucide-react";

const KnowledgeSearch = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("internet");
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
    
    try {
      // Utiliser directement Gemini pour la recherche internet
      const result = await sendMessageToGemini(query, []);
      setResponse(result);
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
    
    try {
      // Rechercher dans la base de connaissances locale
      const searchResults = await kb.searchEntries(query);
      
      if (searchResults.length > 0) {
        // Utiliser les résultats de la recherche comme contexte pour Gemini
        const context = searchResults
          .map(entry => `Q: ${entry.question}\nA: ${entry.answer}`)
          .join('\n\n');
        
        const result = await sendMessageToGemini(query, [], true, context);
        setResponse(result);
      } else {
        // Aucun résultat trouvé, utiliser Gemini sans contexte
        const result = await sendMessageToGemini(
          query, 
          [], 
          true, 
          "Aucune information pertinente trouvée dans la base de connaissances locale."
        );
        setResponse(result);
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
            <Search size={16} />
            Recherche Internet
          </TabsTrigger>
          <TabsTrigger value="local" className="flex items-center gap-2">
            <Database size={16} />
            Recherche Base Locale + Gemini
          </TabsTrigger>
        </TabsList>
        
        <div className="space-y-4">
          <Textarea 
            placeholder="Posez votre question financière..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[100px]"
          />
          
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
                {activeTab === "internet" ? "Rechercher sur Internet" : "Rechercher Base Locale + Gemini"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </Tabs>
      
      {response && (
        <div className="mt-6 p-4 rounded-lg bg-muted">
          <h4 className="font-medium mb-2">Réponse:</h4>
          <p className="text-sm whitespace-pre-line">{response}</p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeSearch;
