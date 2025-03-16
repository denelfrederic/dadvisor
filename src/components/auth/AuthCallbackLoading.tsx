
import { AlertCircle } from "lucide-react";

interface AuthCallbackLoadingProps {
  error: string | null;
}

export const AuthCallbackLoading = ({ error }: AuthCallbackLoadingProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial p-4">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-dadvisor-blue border-t-transparent rounded-full mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold mb-2">Authentification en cours...</h1>
        <p className="text-muted-foreground">Vous allez être redirigé automatiquement.</p>
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
