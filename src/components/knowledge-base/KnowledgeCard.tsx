
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import { KnowledgeEntry } from "./types";

interface KnowledgeCardProps {
  entry: KnowledgeEntry;
  onEdit: (entry: KnowledgeEntry) => void;
  onDelete: (id: string) => void;
}

const KnowledgeCard = ({ entry, onEdit, onDelete }: KnowledgeCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{entry.question}</CardTitle>
        {entry.source && (
          <CardDescription className="text-xs">
            Source: {entry.source}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-3">{entry.answer}</p>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 pt-0">
        <div className="text-xs text-muted-foreground">
          {entry.timestamp && new Date(entry.timestamp).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(entry)}>
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(entry.id)}>
            <Trash2 size={16} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default KnowledgeCard;
