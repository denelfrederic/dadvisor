
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";

interface SearchFormProps {
  query: string;
  setQuery: (value: string) => void;
  activeTab: string;
  includeLocalContent: boolean;
  setIncludeLocalContent: (value: boolean) => void;
  isSearching: boolean;
  onSubmit: () => void;
}

const SearchForm = ({
  query,
  setQuery,
  activeTab,
  includeLocalContent,
  setIncludeLocalContent,
  isSearching,
  onSubmit
}: SearchFormProps) => {
  return (
    <div className="space-y-4">
      <Textarea 
        placeholder="Posez votre question financière..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="min-h-[100px]"
      />
      
      {activeTab === "internet" && (
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="includeLocal" 
            checked={includeLocalContent}
            onCheckedChange={(checked) => setIncludeLocalContent(checked as boolean)}
          />
          <Label htmlFor="includeLocal" className="text-sm cursor-pointer">
            Inclure également le contenu de la base de connaissances locale
          </Label>
        </div>
      )}
      
      <Button 
        onClick={onSubmit} 
        disabled={isSearching || !query.trim()}
        className="w-full"
      >
        {isSearching ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Recherche en cours...
          </>
        ) : (
          <>
            {activeTab === "internet" 
              ? includeLocalContent
                ? "Rechercher sur Internet avec contenu local" 
                : "Rechercher sur Internet uniquement"
              : "Lancer recherche dans la Base Locale et augmenter avec Gemini"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};

export default SearchForm;
