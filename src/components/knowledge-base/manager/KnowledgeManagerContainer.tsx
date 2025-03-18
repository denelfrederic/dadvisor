
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeEntry } from "../types";
import { useKnowledgeBaseService, getKnowledgeBaseStats } from "../services";
import { 
  Card, 
  CardContent, 
  CardHeader
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Plus, Upload } from "lucide-react";

import KnowledgeHeader from "./KnowledgeHeader";
import KnowledgeEntryList from "./KnowledgeEntryList";
import KnowledgeEntryDialog from "./KnowledgeEntryDialog";
import BatchImportDialog from "./BatchImportDialog";

const KnowledgeManagerContainer = () => {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [stats, setStats] = useState({ count: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
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

  const handleBatchImport = () => {
    setIsBatchImportOpen(true);
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
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBatchImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import par lot
          </Button>
          <Button onClick={handleAddEntry}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle entrée
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <KnowledgeHeader 
            entryCount={stats.count}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddEntry={handleAddEntry}
          />
        </CardHeader>
        <CardContent>
          <KnowledgeEntryList 
            entries={filteredEntries}
            isLoading={isLoading}
            searchTerm={searchTerm}
            onAddEntry={handleAddEntry}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        </CardContent>
      </Card>

      <KnowledgeEntryDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentEntry={currentEntry}
        setCurrentEntry={setCurrentEntry}
        isEditing={isEditing}
        onSave={handleSaveEntry}
      />
      
      <BatchImportDialog
        isOpen={isBatchImportOpen}
        onOpenChange={setIsBatchImportOpen}
        onImportComplete={loadEntries}
      />
    </div>
  );
};

export default KnowledgeManagerContainer;
