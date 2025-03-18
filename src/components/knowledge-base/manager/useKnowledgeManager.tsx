
import { useState, useEffect } from "react";
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

  return {
    entries: filteredEntries,
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
