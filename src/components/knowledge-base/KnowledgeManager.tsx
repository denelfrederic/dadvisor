
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeEntry } from "./types";
import { useKnowledgeBaseService, getKnowledgeBaseStats } from "./knowledgeBaseService";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Plus, Edit, Trash2, Database, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const KnowledgeManager = () => {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [stats, setStats] = useState({ count: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<KnowledgeEntry>>({
    question: "",
    answer: "",
    source: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { toast } = useToast();
  const kb = useKnowledgeBaseService();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setIsLoading(true);
    const fetchedEntries = await kb.getEntries();
    setEntries(fetchedEntries);
    
    const fetchedStats = await getKnowledgeBaseStats();
    setStats(fetchedStats);
    
    setIsLoading(false);
  };

  const handleAddEntry = () => {
    setCurrentEntry({
      question: "",
      answer: "",
      source: ""
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditEntry = (entry: KnowledgeEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) {
      const success = await kb.deleteEntry(id);
      if (success) {
        toast({
          title: "Entrée supprimée",
          description: "L'entrée a été supprimée de la base de connaissances"
        });
        loadEntries();
      }
    }
  };

  const handleSaveEntry = async () => {
    if (!currentEntry.question || !currentEntry.answer) {
      toast({
        title: "Champs obligatoires",
        description: "La question et la réponse sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    let success = false;
    
    if (isEditing && currentEntry.id) {
      success = await kb.updateEntry(currentEntry.id, currentEntry);
      if (success) {
        toast({
          title: "Entrée mise à jour",
          description: "L'entrée a été mise à jour dans la base de connaissances"
        });
      }
    } else {
      const result = await kb.addEntry(currentEntry as Omit<KnowledgeEntry, 'id'>);
      success = !!result;
      if (success) {
        toast({
          title: "Entrée ajoutée",
          description: "L'entrée a été ajoutée à la base de connaissances"
        });
      }
    }
    
    if (success) {
      setIsDialogOpen(false);
      loadEntries();
    }
  };

  const filteredEntries = searchTerm 
    ? entries.filter(entry => 
        entry.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        entry.answer.toLowerCase().includes(searchTerm.toLowerCase()))
    : entries;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-5 w-5" />
            Base de Connaissances
          </h2>
          <p className="text-muted-foreground">
            Gérez votre base de connaissances personnalisée
          </p>
        </div>
        
        <Button onClick={handleAddEntry}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle entrée
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Entrées ({stats.count})</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>
            Toutes les entrées de votre base de connaissances
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <p>Chargement des entrées...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                {searchTerm ? "Aucun résultat pour cette recherche" : "Aucune entrée dans la base de connaissances"}
              </p>
              {!searchTerm && (
                <Button variant="outline" className="mt-4" onClick={handleAddEntry}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une entrée
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="p-4 border rounded-md">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{entry.question}</h3>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditEntry(entry)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteEntry(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{entry.answer}</p>
                  {entry.source && (
                    <p className="mt-2 text-xs text-muted-foreground">Source: {entry.source}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Modifier l'entrée" : "Ajouter une nouvelle entrée"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="question" className="text-sm font-medium">
                Question
              </label>
              <Input
                id="question"
                value={currentEntry.question || ""}
                onChange={(e) => setCurrentEntry({...currentEntry, question: e.target.value})}
                placeholder="Qu'est-ce que l'inflation ?"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="answer" className="text-sm font-medium">
                Réponse
              </label>
              <Textarea
                id="answer"
                value={currentEntry.answer || ""}
                onChange={(e) => setCurrentEntry({...currentEntry, answer: e.target.value})}
                placeholder="L'inflation est..."
                className="min-h-[120px]"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="source" className="text-sm font-medium">
                Source (optionnel)
              </label>
              <Input
                id="source"
                value={currentEntry.source || ""}
                onChange={(e) => setCurrentEntry({...currentEntry, source: e.target.value})}
                placeholder="Banque de France, Article..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEntry}>
              {isEditing ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgeManager;
