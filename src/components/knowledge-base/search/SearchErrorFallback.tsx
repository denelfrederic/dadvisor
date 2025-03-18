
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface SearchErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

const SearchErrorFallback = ({ error, resetError }: SearchErrorFallbackProps) => {
  return (
    <div className="p-6 rounded-lg border border-destructive/30 bg-destructive/10 text-center">
      <div className="flex flex-col items-center gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Une erreur s'est produite</h3>
          <p className="text-sm text-muted-foreground">
            {error.message || "Une erreur inattendue est survenue lors de la recherche."}
          </p>
        </div>
        <Button onClick={resetError} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </Button>
      </div>
    </div>
  );
};

export default SearchErrorFallback;
