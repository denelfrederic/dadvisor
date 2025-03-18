
import { KnowledgeEntry } from "./types";
import KnowledgeCard from "./KnowledgeCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface KnowledgeListProps {
  knowledgeBase: KnowledgeEntry[];
  onEdit: (entry: KnowledgeEntry) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const KnowledgeList = ({ knowledgeBase, onEdit, onDelete, onAdd }: KnowledgeListProps) => {
  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-medium mb-4">
        Gérer votre base de connaissances 
        <span className="text-sm font-normal text-muted-foreground ml-2">
          ({knowledgeBase.length} entrées)
        </span>
      </h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        {knowledgeBase.map(entry => (
          <KnowledgeCard 
            key={entry.id} 
            entry={entry} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        ))}
      </div>
      
      {knowledgeBase.length === 0 && (
        <div className="text-center p-8 border rounded-lg bg-muted">
          <p className="text-muted-foreground">Aucune entrée dans votre base de connaissances.</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={onAdd}
          >
            <Plus size={16} className="mr-1" /> Ajouter une entrée
          </Button>
        </div>
      )}
    </div>
  );
};

export default KnowledgeList;
