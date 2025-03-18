
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, BookOpen, Database } from "lucide-react";

interface SearchTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const SearchTabs = ({ activeTab, setActiveTab }: SearchTabsProps) => {
  return (
    <TabsList className="grid grid-cols-2 mb-6">
      <TabsTrigger 
        value="internet" 
        className="flex items-center gap-2 py-3"
        data-active={activeTab === "internet"}
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
      >
        <Database size={16} />
        <div className="flex flex-col items-start text-left">
          <span className="font-medium">Base de Connaissances</span>
          <span className="text-xs text-muted-foreground">Enrichie par Gemini</span>
        </div>
      </TabsTrigger>
    </TabsList>
  );
};

export default SearchTabs;
