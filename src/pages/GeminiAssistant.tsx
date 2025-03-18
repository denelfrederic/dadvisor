
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, Database, Cloud, Plus, Edit, Trash2 } from "lucide-react";
import GeminiChat from "@/components/GeminiChat";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Type pour les entrées de la base de connaissances
interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
}

// Fonction pour charger la base de connaissances depuis le localStorage
const loadKnowledgeBase = (): KnowledgeEntry[] => {
  const savedKnowledge = localStorage.getItem('knowledgeBase');
  if (savedKnowledge) {
    return JSON.parse(savedKnowledge);
  }
  
  // Base de connaissances par défaut si rien n'est sauvegardé
  return [
    {
      id: '1',
      question: "Quels sont les meilleurs investissements à faible risque?",
      answer: "Les investissements à faible risque comprennent les livrets d'épargne réglementés, les fonds en euros des assurances-vie, les obligations d'État et les ETF obligataires. Ces placements offrent une sécurité élevée mais généralement un rendement modéré."
    },
    {
      id: '2',
      question: "Comment diversifier mon portefeuille?",
      answer: "Pour diversifier votre portefeuille, répartissez vos investissements entre différentes classes d'actifs (actions, obligations, immobilier), zones géographiques, secteurs et tailles d'entreprises. Utilisez des ETF pour une diversification à moindre coût et ajustez régulièrement votre allocation en fonction de votre profil de risque."
    },
    {
      id: '3',
      question: "Quels sont les avantages fiscaux de l'assurance-vie?",
      answer: "L'assurance-vie offre des avantages fiscaux significatifs en France: exonération des gains après 8 ans de détention (jusqu'à 4 600€ pour une personne seule, 9 200€ pour un couple), taux forfaitaire de 7,5% au-delà, et transmission facilitée hors succession jusqu'à 152 500€ par bénéficiaire."
    }
  ];
};

// Fonction pour sauvegarder la base de connaissances dans le localStorage
const saveKnowledgeBase = (knowledgeBase: KnowledgeEntry[]) => {
  localStorage.setItem('knowledgeBase', JSON.stringify(knowledgeBase));
};

const GeminiAssistant = () => {
  const [activeTab, setActiveTab] = useState("cloud");
  const [query, setQuery] = useState("");
  const [localResponse, setLocalResponse] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeEntry[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<KnowledgeEntry | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const { toast } = useToast();

  // Charger la base de connaissances au démarrage
  useEffect(() => {
    setKnowledgeBase(loadKnowledgeBase());
  }, []);

  // Sauvegarder la base de connaissances à chaque modification
  useEffect(() => {
    if (knowledgeBase.length > 0) {
      saveKnowledgeBase(knowledgeBase);
    }
  }, [knowledgeBase]);

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
      const bestMatch = knowledgeBase.find(item => 
        item.question.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes(item.question.toLowerCase().split(" ").slice(0, 3).join(" "))
      );
      
      if (bestMatch) {
        setLocalResponse(bestMatch.answer);
      } else {
        setLocalResponse("Aucune réponse correspondante trouvée dans la base de connaissances locale. Essayez une autre question ou utilisez l'assistant Gemini pour une réponse plus générale.");
      }
      setIsSearching(false);
    }, 300);
  };

  const addEntry = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast({
        title: "Champs incomplets",
        description: "Veuillez remplir à la fois la question et la réponse.",
        variant: "destructive"
      });
      return;
    }

    const newEntry: KnowledgeEntry = {
      id: Date.now().toString(),
      question: newQuestion,
      answer: newAnswer
    };

    setKnowledgeBase([...knowledgeBase, newEntry]);
    setNewQuestion("");
    setNewAnswer("");
    setShowAddDialog(false);

    toast({
      title: "Entrée ajoutée",
      description: "La nouvelle entrée a été ajoutée à la base de connaissances.",
    });
  };

  const startEditEntry = (entry: KnowledgeEntry) => {
    setCurrentEntry(entry);
    setNewQuestion(entry.question);
    setNewAnswer(entry.answer);
    setShowEditDialog(true);
  };

  const updateEntry = () => {
    if (!currentEntry || !newQuestion.trim() || !newAnswer.trim()) {
      return;
    }

    const updatedKnowledgeBase = knowledgeBase.map(entry => 
      entry.id === currentEntry.id 
        ? { ...entry, question: newQuestion, answer: newAnswer } 
        : entry
    );

    setKnowledgeBase(updatedKnowledgeBase);
    setShowEditDialog(false);
    setCurrentEntry(null);
    setNewQuestion("");
    setNewAnswer("");

    toast({
      title: "Entrée mise à jour",
      description: "L'entrée a été mise à jour dans la base de connaissances.",
    });
  };

  const deleteEntry = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) {
      const filteredKnowledgeBase = knowledgeBase.filter(entry => entry.id !== id);
      setKnowledgeBase(filteredKnowledgeBase);
      
      toast({
        title: "Entrée supprimée",
        description: "L'entrée a été supprimée de la base de connaissances.",
      });
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
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Recherche dans la base de connaissances</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => {
                      setNewQuestion("");
                      setNewAnswer("");
                      setShowAddDialog(true);
                    }}
                  >
                    <Plus size={16} /> Ajouter
                  </Button>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4">
                  Posez une question financière pour rechercher dans votre base de connaissances personnalisée.
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

              {/* Section de gestion de la base de connaissances */}
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Gérer votre base de connaissances</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {knowledgeBase.map(entry => (
                    <Card key={entry.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{entry.question}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground line-clamp-3">{entry.answer}</p>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 pt-0">
                        <Button variant="ghost" size="sm" onClick={() => startEditEntry(entry)}>
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteEntry(entry.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                
                {knowledgeBase.length === 0 && (
                  <div className="text-center p-8 border rounded-lg bg-muted">
                    <p className="text-muted-foreground">Aucune entrée dans votre base de connaissances.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setNewQuestion("");
                        setNewAnswer("");
                        setShowAddDialog(true);
                      }}
                    >
                      <Plus size={16} className="mr-1" /> Ajouter une entrée
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogue pour ajouter une nouvelle entrée */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une entrée</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="question" className="text-sm font-medium">Question</label>
              <Input
                id="question"
                placeholder="Entrez une question financière..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="answer" className="text-sm font-medium">Réponse</label>
              <Textarea
                id="answer"
                placeholder="Entrez la réponse à cette question..."
                rows={6}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={addEntry}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue pour modifier une entrée existante */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'entrée</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-question" className="text-sm font-medium">Question</label>
              <Input
                id="edit-question"
                placeholder="Entrez une question financière..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-answer" className="text-sm font-medium">Réponse</label>
              <Textarea
                id="edit-answer"
                placeholder="Entrez la réponse à cette question..."
                rows={6}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={updateEntry}>Mettre à jour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GeminiAssistant;
