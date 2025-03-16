
import { AlertCircle } from "lucide-react";

interface AuthCallbackLoadingProps {
  error: string | null;
}

export const AuthCallbackLoading = ({ error }: AuthCallbackLoadingProps) => {
  // Check if the error is related to an invalid email domain
  const isInvalidDomainError = error?.toLowerCase().includes('invalid') && 
                               (error?.includes('.air') || error?.includes('email'));
  
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
            
            {isInvalidDomainError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-md mb-4 text-left">
                <p className="font-medium mb-1">Problème de domaine email</p>
                <p className="text-sm mb-2">
                  Certains domaines comme <strong>".air"</strong> ne sont pas reconnus comme des domaines valides.
                  Veuillez utiliser un email avec un domaine standard comme .com, .fr, .org, .ai, etc.
                </p>
                <p className="text-xs">
                  Par exemple: utilisez <strong>nom@exemple.com</strong> au lieu de <strong>nom@exemple.air</strong>
                </p>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              Si l'erreur persiste, vérifiez que votre adresse email est valide et réessayez.
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
