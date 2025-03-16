
import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface AuthCallbackLoadingProps {
  error: string | null;
}

export const AuthCallbackLoading = ({ error }: AuthCallbackLoadingProps) => {
  // Check if the error is related to an invalid email domain
  const isInvalidDomainError = error?.toLowerCase().includes('invalid') && 
                               (error?.includes('.air') || error?.includes('email'));
  
  // Check if error mentions user doesn't exist (could happen after database update)
  const isUserNotFoundError = error?.toLowerCase().includes('user') && 
                              error?.toLowerCase().includes('not found');
  
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
                  Veuillez utiliser un email avec un domaine standard comme .com, .fr, .org, <strong>.ai</strong>, etc.
                </p>
                <p className="text-xs mb-2">
                  Par exemple: utilisez <strong>nom@exemple.com</strong> au lieu de <strong>nom@exemple.air</strong>
                </p>
                <p className="text-sm font-medium">Votre email a été mis à jour dans notre base de données vers <strong>frederic.denel@dadvisor.ai</strong></p>
              </div>
            )}
            
            {isUserNotFoundError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 rounded-md mb-4 text-left">
                <p className="font-medium mb-1">Utilisateur non trouvé</p>
                <p className="text-sm mb-2">
                  Votre email a été mis à jour de <strong>frederic.denel@dadvisor.air</strong> à <strong>frederic.denel@dadvisor.ai</strong>.
                  Veuillez vous connecter avec votre nouvelle adresse email.
                </p>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground mb-4">
              Si l'erreur persiste, essayez de vous connecter avec l'adresse email <strong>frederic.denel@dadvisor.ai</strong> au lieu de <strong>frederic.denel@dadvisor.air</strong>.
            </p>
            
            <Link 
              to="/auth"
              className="mt-4 inline-block px-4 py-2 bg-dadvisor-blue text-white rounded-md hover:bg-dadvisor-blue/90"
            >
              Retour à la page de connexion
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
