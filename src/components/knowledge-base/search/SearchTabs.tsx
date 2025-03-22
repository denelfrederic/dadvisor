
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, BookOpen, Database, FileText, Network } from "lucide-react";

interface SearchTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const SearchTabs = ({ activeTab, setActiveTab }: SearchTabsProps) => {
  return (
    <TabsList className="flex w-full mb-6 overflow-x-auto">
      <TabsTrigger 
        value="internet" 
        className="flex items-center gap-1 py-2 px-3"
        data-active={activeTab === "internet"}
        onClick={() => setActiveTab("internet")}
      >
        <Globe size={16} />
        <span className="font-medium">Recherche Web</span>
      </TabsTrigger>
      <TabsTrigger 
        value="local" 
        className="flex items-center gap-1 py-2 px-3"
        data-active={activeTab === "local"}
        onClick={() => setActiveTab("local")}
      >
        <Database size={16} />
        <span className="font-medium">Base de Connaissances</span>
      </TabsTrigger>
      <TabsTrigger 
        value="documents" 
        className="flex items-center gap-1 py-2 px-3"
        data-active={activeTab === "documents"}
        onClick={() => setActiveTab("documents")}
      >
        <FileText size={16} />
        <span className="font-medium">Documents</span>
      </TabsTrigger>
      <TabsTrigger 
        value="semantic" 
        className="flex items-center gap-1 py-2 px-3"
        data-active={activeTab === "semantic"}
        onClick={() => setActiveTab("semantic")}
      >
        <Network size={16} />
        <span className="font-medium">Recherche Sémantique</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default SearchTabs;
