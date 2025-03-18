
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeEntry } from "../types";
import { useKnowledgeBaseService, getKnowledgeBaseStats } from "../services";

export const useKnowledgeManager = () => {
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
  const [allEntries, setAllEntries] = useState<KnowledgeEntry[]>([]);
  
  const { toast } = useToast();
  const kb = useKnowledgeBaseService();

  // Charger toutes les entrées au début
  useEffect(() => {
    loadEntries();
  }, []);

  // Filtrer les entrées basées sur le terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setEntries(allEntries);
    } else {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const filtered = allEntries.filter(entry => 
        entry.question.toLowerCase().includes(lowerCaseSearchTerm) || 
        entry.answer.toLowerCase().includes(lowerCaseSearchTerm)
      );
      setEntries(filtered);
    }
  }, [searchTerm, allEntries]);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      const fetchedEntries = await kb.getEntries();
      setAllEntries(fetchedEntries);
      setEntries(fetchedEntries);
      
      const fetchedStats = await getKnowledgeBaseStats();
      setStats(fetchedStats);
    } catch (error) {
      console.error("Erreur lors du chargement des entrées:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les entrées de la base de connaissances",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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

  return {
    entries,
    stats,
    isLoading,
    isDialogOpen,
    isBatchImportOpen,
    currentEntry,
    isEditing,
    searchTerm,
    setSearchTerm,
    handleAddEntry,
    handleEditEntry,
    handleDeleteEntry,
    handleSaveEntry,
    handleBatchImport,
    setIsDialogOpen,
    setIsBatchImportOpen,
    setCurrentEntry,
    loadEntries
  };
};
