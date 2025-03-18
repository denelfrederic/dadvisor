
interface SearchResultsProps {
  response: string;
  sources: string[];
}

const SearchResults = ({ response, sources }: SearchResultsProps) => {
  if (!response) return null;
  
  return (
    <div className="mt-6 space-y-4">
      <div className="p-4 rounded-lg bg-muted">
        <h4 className="font-medium mb-2">Réponse:</h4>
        <p className="text-sm whitespace-pre-line">{response}</p>
      </div>
      
      {sources.length > 0 && (
        <div className="p-4 rounded-lg border border-muted">
          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Sources:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            {sources.map((source, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{source}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
