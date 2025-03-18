
import { Tabs, TabsContent } from "@/components/ui/tabs";
import SearchTabs from "./search/SearchTabs";
import SearchForm from "./search/SearchForm";
import SearchResults from "./search/SearchResults";
import { useKnowledgeSearch } from "./search/useKnowledgeSearch";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import SearchErrorFallback from "./search/SearchErrorFallback";

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
    handleSearch,
    debugLogs
  } = useKnowledgeSearch();

  return (
    <div>
      <Tabs defaultValue="internet" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <SearchTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        
        <div className="space-y-4">
          <ErrorBoundary
            fallback={(error, resetError) => (
              <SearchErrorFallback error={error} resetError={resetError} />
            )}
          >
            <SearchForm
              query={query}
              setQuery={setQuery}
              activeTab={activeTab}
              includeLocalContent={includeLocalContent}
              setIncludeLocalContent={setIncludeLocalContent}
              isSearching={isSearching}
              onSubmit={handleSearch}
            />
          </ErrorBoundary>
        </div>
      </Tabs>
      
      <ErrorBoundary
        fallback={(error, resetError) => (
          <SearchErrorFallback error={error} resetError={resetError} />
        )}
      >
        <SearchResults 
          query={query}
          response={response} 
          sources={sources}
          isLoading={isSearching}
          debugLogs={debugLogs}
        />
      </ErrorBoundary>
    </div>
  );
};

export default KnowledgeSearch;
