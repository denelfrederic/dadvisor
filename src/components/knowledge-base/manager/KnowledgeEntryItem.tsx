
import React from "react";
import { Button } from "@/components/ui/button";
import { KnowledgeEntry } from "../types";
import { Edit, Trash2 } from "lucide-react";

interface KnowledgeEntryItemProps {
  entry: KnowledgeEntry;
  onEdit: (entry: KnowledgeEntry) => void;
  onDelete: (id: string) => void;
}

const KnowledgeEntryItem = ({ entry, onEdit, onDelete }: KnowledgeEntryItemProps) => {
  return (
    <div className="p-4 border rounded-md">
      <div className="flex justify-between items-start">
        <h3 className="font-medium">{entry.question}</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(entry)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(entry.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{entry.answer}</p>
      {entry.source && (
        <p className="mt-2 text-xs text-muted-foreground">Source: {entry.source}</p>
      )}
    </div>
  );
};

export default KnowledgeEntryItem;
