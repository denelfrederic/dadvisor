
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface SearchResultsProps {
  response: string;
  sources: string[];
}

const SearchResults = ({ response, sources }: SearchResultsProps) => {
  if (!response) return null;
  
  // Grouper les sources par type
  const knowledgeBaseSources = sources.filter(s => s.includes("Base de connaissances"));
  const internetSources = sources.filter(s => s.includes("Internet") || s.includes("Gemini"));
  const documentSources = sources.filter(s => !s.includes("Base de connaissances") && !s.includes("Internet") && !s.includes("Gemini"));
  
  return (
    <div className="mt-6 space-y-4">
      <div className="p-6 rounded-lg bg-card border shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-primary/10 p-2 rounded-full">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-lg mb-1">Réponse</h4>
            {internetSources.length > 0 && knowledgeBaseSources.length === 0 && (
              <p className="text-xs text-muted-foreground mb-2">
                Généré via Gemini avec des données d'internet
              </p>
            )}
            {knowledgeBaseSources.length > 0 && (
              <p className="text-xs text-muted-foreground mb-2">
                Généré à partir de {knowledgeBaseSources.length} entrée(s) de la base de connaissances
              </p>
            )}
          </div>
        </div>
        
        <div className="text-sm whitespace-pre-line border-l-4 border-primary/20 pl-4 py-1">
          {response}
        </div>
      </div>
      
      {sources.length > 0 && (
        <div className="p-4 rounded-lg border">
          <h4 className="font-medium mb-3 text-sm flex items-center gap-2">
            Sources utilisées
            <Badge variant="outline" className="ml-2">
              {sources.length}
            </Badge>
          </h4>
          
          {knowledgeBaseSources.length > 0 && (
            <div className="mb-3">
              <h5 className="text-xs uppercase text-muted-foreground font-semibold mb-2">Base de connaissances</h5>
              <ul className="text-xs space-y-1.5">
                {knowledgeBaseSources.map((source, index) => (
                  <li key={`kb-${index}`} className="flex items-start bg-muted/50 p-2 rounded">
                    <span className="mr-2 text-primary">•</span>
                    <span>{source.replace("Base de connaissances: ", "")}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {documentSources.length > 0 && (
            <div className="mb-3">
              <h5 className="text-xs uppercase text-muted-foreground font-semibold mb-2">Documents</h5>
              <ul className="text-xs space-y-1.5">
                {documentSources.map((source, index) => (
                  <li key={`doc-${index}`} className="flex items-start bg-muted/50 p-2 rounded">
                    <span className="mr-2 text-primary">•</span>
                    <span>{source}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {internetSources.length > 0 && (
            <div>
              <h5 className="text-xs uppercase text-muted-foreground font-semibold mb-2">Internet</h5>
              <ul className="text-xs space-y-1.5">
                {internetSources.map((source, index) => (
                  <li key={`inet-${index}`} className="flex items-start bg-muted/50 p-2 rounded">
                    <span className="mr-2 text-primary">•</span>
                    <span>{source}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
