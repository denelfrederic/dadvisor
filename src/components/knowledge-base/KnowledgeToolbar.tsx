
import { Button } from "@/components/ui/button";
import { Plus, Import, FileText } from "lucide-react";

interface KnowledgeToolbarProps {
  onAdd: () => void;
  onImport: () => void;
  onExport: () => void;
}

const KnowledgeToolbar = ({ onAdd, onImport, onExport }: KnowledgeToolbarProps) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-medium">Recherche dans la base de connaissances</h3>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={onAdd}
        >
          <Plus size={16} /> Ajouter
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={onImport}
        >
          <Import size={16} /> Importer
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={onExport}
        >
          <FileText size={16} /> Exporter
        </Button>
      </div>
    </div>
  );
};

export default KnowledgeToolbar;
