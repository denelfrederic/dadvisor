
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, Database, Cloud } from "lucide-react";
import GeminiChat from "@/components/GeminiChat";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Mock knowledge base for demonstration
const KNOWLEDGE_BASE = [
  {
    question: "Quels sont les meilleurs investissements à faible risque?",
    answer: "Les investissements à faible risque comprennent les livrets d'épargne réglementés, les fonds en euros des assurances-vie, les obligations d'État et les ETF obligataires. Ces placements offrent une sécurité élevée mais généralement un rendement modéré."
  },
  {
    question: "Comment diversifier mon portefeuille?",
    answer: "Pour diversifier votre portefeuille, répartissez vos investissements entre différentes classes d'actifs (actions, obligations, immobilier), zones géographiques, secteurs et tailles d'entreprises. Utilisez des ETF pour une diversification à moindre coût et ajustez régulièrement votre allocation en fonction de votre profil de risque."
  },
  {
    question: "Quels sont les avantages fiscaux de l'assurance-vie?",
    answer: "L'assurance-vie offre des avantages fiscaux significatifs en France: exonération des gains après 8 ans de détention (jusqu'à 4 600€ pour une personne seule, 9 200€ pour un couple), taux forfaitaire de 7,5% au-delà, et transmission facilitée hors succession jusqu'à 152 500€ par bénéficiaire."
  }
];

const GeminiAssistant = () => {
  const [activeTab, setActiveTab] = useState("cloud");
  const [query, setQuery] = useState("");
  const [localResponse, setLocalResponse] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleLocalSearch = () => {
    if (!query.trim()) {
      toast({
        title: "Question vide",
        description: "Veuillez entrer une question pour rechercher dans la base de connaissances.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setLocalResponse("");
    
    // Simulate search delay
    setTimeout(() => {
      // Simple search based on similarity
      const bestMatch = KNOWLEDGE_BASE.find(item => 
        item.question.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes(item.question.toLowerCase().split(" ").slice(0, 3).join(" "))
      );
      
      if (bestMatch) {
        setLocalResponse(bestMatch.answer);
      } else {
        setLocalResponse("Aucune réponse correspondante trouvée dans la base de connaissances locale. Essayez une autre question ou utilisez l'assistant Gemini pour une réponse plus générale.");
      }
      setIsSearching(false);
    }, 1000);
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
        
        <Tabs defaultValue="cloud" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="cloud" className="flex items-center gap-2">
              <Cloud size={16} />
              Gemini (Cloud)
            </TabsTrigger>
            <TabsTrigger value="local" className="flex items-center gap-2">
              <Database size={16} />
              Base de connaissances locale
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="cloud" className="mt-0">
            <GeminiChat />
          </TabsContent>
          
          <TabsContent value="local" className="mt-0">
            <div className="border rounded-lg p-4 bg-card">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Recherche dans la base de connaissances</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Posez une question financière pour rechercher dans notre base de connaissances locale.
                </p>
                
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Posez votre question financière..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="min-h-[100px]"
                  />
                  
                  <Button 
                    onClick={handleLocalSearch} 
                    disabled={isSearching || !query.trim()}
                    className="w-full"
                  >
                    {isSearching ? "Recherche en cours..." : "Rechercher"}
                  </Button>
                </div>
              </div>
              
              {localResponse && (
                <div className="mt-6 p-4 rounded-lg bg-muted">
                  <h4 className="font-medium mb-2">Réponse:</h4>
                  <p className="text-sm whitespace-pre-line">{localResponse}</p>
                </div>
              )}
              
              <div className="mt-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <h4 className="font-medium mb-2 text-yellow-800">À propos de la base de connaissances</h4>
                <p className="text-sm text-yellow-700">
                  Cette fonctionnalité utilise une base de connaissances locale et limitée. Pour des réponses plus complètes,
                  utilisez l'assistant Gemini. Vous pouvez étendre cette base de connaissances avec vos propres données financières.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GeminiAssistant;
