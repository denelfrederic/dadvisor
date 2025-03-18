
import React from "react";
import { Button } from "@/components/ui/button";
import { KnowledgeEntry } from "../types";
import KnowledgeEntryItem from "./KnowledgeEntryItem";
import { Plus } from "lucide-react";

interface KnowledgeEntryListProps {
  entries: KnowledgeEntry[];
  isLoading: boolean;
  searchTerm: string;
  onAddEntry: () => void;
  onEditEntry: (entry: KnowledgeEntry) => void;
  onDeleteEntry: (id: string) => void;
}

const KnowledgeEntryList = ({
  entries,
  isLoading,
  searchTerm,
  onAddEntry,
  onEditEntry,
  onDeleteEntry
}: KnowledgeEntryListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <p>Chargement des entrées...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">
          {searchTerm ? "Aucun résultat pour cette recherche" : "Aucune entrée dans la base de connaissances"}
        </p>
        {!searchTerm && (
          <Button variant="outline" className="mt-4" onClick={onAddEntry}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une entrée
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <KnowledgeEntryItem
          key={entry.id}
          entry={entry}
          onEdit={onEditEntry}
          onDelete={onDeleteEntry}
        />
      ))}
    </div>
  );
};

export default KnowledgeEntryList;
