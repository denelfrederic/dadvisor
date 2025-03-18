
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader
} from "@/components/ui/card";

import KnowledgeHeader from "./KnowledgeHeader";
import KnowledgeEntryList from "./KnowledgeEntryList";
import KnowledgeEntryDialog from "./KnowledgeEntryDialog";
import BatchImportDialog from "./BatchImportDialog";
import KnowledgeStats from "./KnowledgeStats";
import KnowledgeActionButtons from "./KnowledgeActionButtons";
import { useKnowledgeManager } from "./useKnowledgeManager";

const KnowledgeManagerContainer = () => {
  const {
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
  } = useKnowledgeManager();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <KnowledgeStats stats={stats} />
        <KnowledgeActionButtons 
          onAddEntry={handleAddEntry} 
          onBatchImport={handleBatchImport} 
        />
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
            entries={entries}
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
