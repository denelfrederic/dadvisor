
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, BookOpen } from "lucide-react";

interface SearchTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const SearchTabs = ({ activeTab, setActiveTab }: SearchTabsProps) => {
  return (
    <TabsList className="grid grid-cols-2 mb-6">
      <TabsTrigger 
        value="internet" 
        className="flex items-center gap-2"
        data-active={activeTab === "internet"}
      >
        <Globe size={16} />
        Recherche Internet
      </TabsTrigger>
      <TabsTrigger 
        value="local" 
        className="flex items-center gap-2"
        data-active={activeTab === "local"}
      >
        <BookOpen size={16} />
        Base Locale + Gemini
      </TabsTrigger>
    </TabsList>
  );
};

export default SearchTabs;
