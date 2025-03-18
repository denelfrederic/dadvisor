
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Database, FileText } from "lucide-react";

interface SearchFormProps {
  query: string;
  setQuery: (query: string) => void;
  onSubmit: () => void;
  isSearching: boolean;
  activeTab: string;
  includeLocalContent: boolean;
  setIncludeLocalContent: (value: boolean) => void;
}

const SearchForm = ({
  query,
  setQuery,
  onSubmit,
  isSearching,
  activeTab,
  includeLocalContent,
  setIncludeLocalContent
}: SearchFormProps) => {
  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-3"
    >
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Posez votre question..."
          className="pr-32"
          disabled={isSearching}
        />
        <Button 
          type="submit" 
          className="absolute right-1 top-1 h-8"
          disabled={isSearching}
        >
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Recherche...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Rechercher
            </>
          )}
        </Button>
      </div>
      
      {activeTab === "internet" && (
        <div className="flex items-center space-x-2">
          <Switch
            id="include-local"
            checked={includeLocalContent}
            onCheckedChange={setIncludeLocalContent}
          />
          <Label htmlFor="include-local" className="flex items-center gap-1 text-sm cursor-pointer">
            <div className="flex items-center gap-1">
              <Database size={14} className="text-muted-foreground" />
              <FileText size={14} className="text-muted-foreground" />
            </div>
            Inclure également le contenu local (base de connaissances et documents)
          </Label>
        </div>
      )}
    </form>
  );
};

export default SearchForm;
