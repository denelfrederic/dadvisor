
import { Tabs, TabsContent } from "@/components/ui/tabs";
import SearchTabs from "./search/SearchTabs";
import SearchForm from "./search/SearchForm";
import SearchResults from "./search/SearchResults";
import { useKnowledgeSearch } from "./search/useKnowledgeSearch";

const KnowledgeSearch = () => {
  const {
    query,
    setQuery,
    response,
    sources,
    isSearching,
    activeTab,
    setActiveTab,
    includeLocalContent,
    setIncludeLocalContent,
    handleSearch
  } = useKnowledgeSearch();

  return (
    <div>
      <Tabs defaultValue="internet" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <SearchTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        
        <div className="space-y-4">
          <SearchForm
            query={query}
            setQuery={setQuery}
            activeTab={activeTab}
            includeLocalContent={includeLocalContent}
            setIncludeLocalContent={setIncludeLocalContent}
            isSearching={isSearching}
            onSubmit={handleSearch}
          />
        </div>
      </Tabs>
      
      <SearchResults 
        response={response} 
        sources={sources} 
      />
    </div>
  );
};

export default KnowledgeSearch;
