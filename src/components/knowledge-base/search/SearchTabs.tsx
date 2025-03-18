
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, BookOpen, Database, FileText, Vector } from "lucide-react";

interface SearchTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const SearchTabs = ({ activeTab, setActiveTab }: SearchTabsProps) => {
  return (
    <TabsList className="grid grid-cols-4 mb-6">
      <TabsTrigger 
        value="internet" 
        className="flex items-center gap-2 py-3"
        data-active={activeTab === "internet"}
        onClick={() => setActiveTab("internet")}
      >
        <Globe size={16} />
        <div className="flex flex-col items-start text-left">
          <span className="font-medium">Recherche Internet</span>
          <span className="text-xs text-muted-foreground">Via Gemini</span>
        </div>
      </TabsTrigger>
      <TabsTrigger 
        value="local" 
        className="flex items-center gap-2 py-3"
        data-active={activeTab === "local"}
        onClick={() => setActiveTab("local")}
      >
        <Database size={16} />
        <div className="flex flex-col items-start text-left">
          <span className="font-medium">Base de Connaissances</span>
          <span className="text-xs text-muted-foreground">Enrichie par Gemini</span>
        </div>
      </TabsTrigger>
      <TabsTrigger 
        value="documents" 
        className="flex items-center gap-2 py-3"
        data-active={activeTab === "documents"}
        onClick={() => setActiveTab("documents")}
      >
        <FileText size={16} />
        <div className="flex flex-col items-start text-left">
          <span className="font-medium">Documents</span>
          <span className="text-xs text-muted-foreground">PDF et autres fichiers</span>
        </div>
      </TabsTrigger>
      <TabsTrigger 
        value="semantic" 
        className="flex items-center gap-2 py-3"
        data-active={activeTab === "semantic"}
        onClick={() => setActiveTab("semantic")}
      >
        <Vector size={16} />
        <div className="flex flex-col items-start text-left">
          <span className="font-medium">Recherche Sémantique</span>
          <span className="text-xs text-muted-foreground">Vectorisation</span>
        </div>
      </TabsTrigger>
    </TabsList>
  );
};

export default SearchTabs;
