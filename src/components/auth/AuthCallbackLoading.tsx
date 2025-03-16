
import { AlertCircle } from "lucide-react";

interface AuthCallbackLoadingProps {
  error: string | null;
}

export const AuthCallbackLoading = ({ error }: AuthCallbackLoadingProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial p-4">
      <div className="text-center max-w-md">
        {!error ? (
          <>
            <div className="animate-spin h-8 w-8 border-4 border-dadvisor-blue border-t-transparent rounded-full mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold mb-2">Authentification en cours...</h1>
            <p className="text-muted-foreground">Vous allez être redirigé automatiquement.</p>
          </>
        ) : (
          <>
            <div className="p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2 mb-4">
              <AlertCircle size={20} />
              <span className="font-medium">Problème d'authentification</span>
            </div>
            <p className="mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">
              Si l'erreur persiste, vérifiez que votre adresse email est valide et réessayez.
              Certains domaines comme ".air" peuvent ne pas être reconnus comme valides.
            </p>
            <a 
              href="/auth"
              className="mt-4 inline-block px-4 py-2 bg-dadvisor-blue text-white rounded-md hover:bg-dadvisor-blue/90"
            >
              Retour à la page de connexion
            </a>
          </>
        )}
      </div>
    </div>
  );
};
