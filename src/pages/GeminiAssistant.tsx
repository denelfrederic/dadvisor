
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, Database, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { sendMessageToGemini } from "@/components/chat/services";

const GeminiAssistant = () => {
  const [activeTab, setActiveTab] = useState("internet");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInternetSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Question vide",
        description: "Veuillez entrer une question pour rechercher sur internet.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
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
      setIsLoading(false);
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

    setIsLoading(true);
    setResponse("");
    
    try {
      // Simuler une recherche RAG puis Gemini
      // Dans un cas réel, cette fonction utiliserait d'abord la recherche locale RAG
      // puis passerait à Gemini avec le contexte approprié
      const result = await sendMessageToGemini(query, [], true);
      setResponse(result);
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la recherche. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "internet") {
      handleInternetSearch();
    } else {
      handleLocalSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-radial py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Assistant IA Financier</h1>
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link to="/">
              <Home size={18} />
              Accueil
            </Link>
          </Button>
        </div>
        
        <p className="text-muted-foreground text-center mb-8">
          Posez vos questions financières et obtenez des réponses personnalisées alimentées par l'IA.
        </p>
        
        <div className="border rounded-lg p-6 bg-card shadow-sm">
          <Tabs defaultValue="internet" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="internet" className="flex items-center gap-2">
                <Search size={16} />
                Recherche Internet
              </TabsTrigger>
              <TabsTrigger value="local" className="flex items-center gap-2">
                <Database size={16} />
                Recherche Locale + Gemini
              </TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea 
                placeholder="Posez votre question financière..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[100px]"
              />
              
              <Button 
                type="submit"
                disabled={isLoading || !query.trim()}
                className="w-full"
              >
                {isLoading ? "Recherche en cours..." : activeTab === "internet" ? "Rechercher sur Internet" : "Rechercher en Local + Gemini"}
              </Button>
            </form>
            
            {response && (
              <div className="mt-6 p-4 rounded-lg bg-muted">
                <h4 className="font-medium mb-2">Réponse:</h4>
                <p className="text-sm whitespace-pre-line">{response}</p>
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default GeminiAssistant;
