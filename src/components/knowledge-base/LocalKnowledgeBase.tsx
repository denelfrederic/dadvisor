
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeEntry } from "./types";
import { loadKnowledgeBase, saveKnowledgeBase, exportKnowledgeBase } from "./KnowledgeStorage";
import KnowledgeToolbar from "./KnowledgeToolbar";
import KnowledgeSearch from "./KnowledgeSearch";
import KnowledgeList from "./KnowledgeList";
import AddEntryDialog from "./AddEntryDialog";
import EditEntryDialog from "./EditEntryDialog";
import ImportDialog from "./ImportDialog";

const LocalKnowledgeBase = () => {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeEntry[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<KnowledgeEntry | null>(null);
  const { toast } = useToast();

  // Load the knowledge base on startup
  useEffect(() => {
    setKnowledgeBase(loadKnowledgeBase());
  }, []);

  // Save the knowledge base on each modification
  useEffect(() => {
    if (knowledgeBase.length > 0) {
      saveKnowledgeBase(knowledgeBase);
    }
  }, [knowledgeBase]);

  const handleAddEntry = (question: string, answer: string) => {
    const newEntry: KnowledgeEntry = {
      id: Date.now().toString(),
      question,
      answer,
      timestamp: Date.now()
    };

    setKnowledgeBase([...knowledgeBase, newEntry]);
    
    toast({
      title: "Entrée ajoutée",
      description: "La nouvelle entrée a été ajoutée à la base de connaissances.",
    });
  };

  const handleUpdateEntry = (question: string, answer: string) => {
    if (!currentEntry) return;

    const updatedKnowledgeBase = knowledgeBase.map(entry => 
      entry.id === currentEntry.id 
        ? { 
            ...entry, 
            question, 
            answer,
            timestamp: Date.now() 
          } 
        : entry
    );

    setKnowledgeBase(updatedKnowledgeBase);
    setCurrentEntry(null);
    
    toast({
      title: "Entrée mise à jour",
      description: "L'entrée a été mise à jour dans la base de connaissances.",
    });
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) {
      const filteredKnowledgeBase = knowledgeBase.filter(entry => entry.id !== id);
      setKnowledgeBase(filteredKnowledgeBase);
      
      toast({
        title: "Entrée supprimée",
        description: "L'entrée a été supprimée de la base de connaissances.",
      });
    }
  };

  const handleEditEntry = (entry: KnowledgeEntry) => {
    setCurrentEntry(entry);
    setShowEditDialog(true);
  };

  const handleImportEntries = (importedEntries: KnowledgeEntry[]) => {
    setKnowledgeBase([...knowledgeBase, ...importedEntries]);
    
    toast({
      title: "Importation réussie",
      description: `${importedEntries.length} entrées ont été ajoutées à la base de connaissances.`,
    });
  };

  const handleExportKnowledgeBase = () => {
    exportKnowledgeBase(knowledgeBase);
    
    toast({
      title: "Exportation réussie",
      description: "Votre base de connaissances a été exportée avec succès.",
    });
  };

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="mb-4">
        <KnowledgeToolbar 
          onAdd={() => setShowAddDialog(true)} 
          onImport={() => setShowImportDialog(true)} 
          onExport={handleExportKnowledgeBase} 
        />
        
        <p className="text-muted-foreground text-sm mb-4">
          Posez une question financière pour rechercher dans votre base de connaissances personnalisée.
        </p>
        
        <KnowledgeSearch knowledgeBase={knowledgeBase} />
      </div>

      <KnowledgeList 
        knowledgeBase={knowledgeBase}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
        onAdd={() => setShowAddDialog(true)}
      />

      <AddEntryDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddEntry}
      />

      <EditEntryDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        currentEntry={currentEntry}
        onUpdate={handleUpdateEntry}
      />

      <ImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleImportEntries}
      />
    </div>
  );
};

export default LocalKnowledgeBase;
