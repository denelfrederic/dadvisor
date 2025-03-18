
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Plus, Database } from "lucide-react";
import { KnowledgeEntry } from "../types";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="space-y-3">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="border rounded-md p-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="text-center py-12 border rounded-md">
        <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">
          Aucune entrée{searchTerm ? " trouvée" : ""}
        </h3>
        <p className="text-muted-foreground mb-4">
          {searchTerm 
            ? `Aucun résultat pour "${searchTerm}". Essayez avec d'autres termes.` 
            : "Commencez à créer votre base de connaissances personnalisée."}
        </p>
        {!searchTerm && (
          <Button onClick={onAddEntry}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une entrée
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div 
          key={entry.id}
          className="border rounded-md p-4 transition-colors hover:bg-accent/10"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1 flex-1">
              <h3 className="font-medium text-base">{entry.question}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2">{entry.answer}</p>
              {entry.source && (
                <p className="text-xs text-muted-foreground">
                  Source: {entry.source}
                </p>
              )}
            </div>
            <div className="flex space-x-2 ml-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEditEntry(entry)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDeleteEntry(entry.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KnowledgeEntryList;
