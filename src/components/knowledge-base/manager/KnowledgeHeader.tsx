
import React from "react";
import { Button } from "@/components/ui/button";
import { Database, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";

interface KnowledgeHeaderProps {
  entryCount: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddEntry: () => void;
}

const KnowledgeHeader = ({
  entryCount,
  searchTerm,
  onSearchChange,
  onAddEntry,
}: KnowledgeHeaderProps) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-5 w-5" />
            Base de Connaissances
          </h2>
          <p className="text-muted-foreground">
            Gérez votre base de connaissances personnalisée
          </p>
        </div>
        
        <Button onClick={onAddEntry}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle entrée
        </Button>
      </div>
      
      <div className="flex justify-between items-center">
        <CardTitle>Entrées ({entryCount})</CardTitle>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-8 w-[250px]"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <CardDescription>
        Toutes les entrées de votre base de connaissances
      </CardDescription>
    </>
  );
};

export default KnowledgeHeader;
