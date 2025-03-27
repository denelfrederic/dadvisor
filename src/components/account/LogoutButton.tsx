
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

/**
 * Composant de bouton de déconnexion
 * Utilise le contexte d'authentification pour assurer une déconnexion complète
 * Version renforcée pour la production avec double vérification
 */
const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      console.log("Démarrage de la procédure de déconnexion...");
      
      // Affichage d'un toast de chargement
      toast.loading("Déconnexion en cours...");
      
      // Nettoyer immédiatement les données locales pour une UI réactive
      // Suppression préventive des données de session connues
      const keysToRemove = [
        'user', 
        'dadvisor_user', 
        'supabase.auth.token',
        'sb-zbiyxrzbqisamabxkeqg-auth-token'
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch (e) {
          console.warn(`Erreur lors de la suppression de ${key}:`, e);
        }
      });
      
      // Utiliser la fonction de déconnexion du contexte d'authentification
      await logout();
      
      // Fermer le toast de chargement et afficher un succès
      toast.dismiss();
      toast.success("Déconnexion réussie");
      
      // Navigation forcée vers la page d'accueil après un léger délai
      setTimeout(() => {
        navigate("/");
        window.location.reload(); // Force un rechargement complet pour réinitialiser l'état
      }, 100);
      
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.dismiss();
      toast.error("Erreur lors de la déconnexion");
      
      // En cas d'erreur, forcer la navigation, le rechargement et nettoyer localement
      setTimeout(() => {
        navigate("/");
        window.location.reload(); // Force un rechargement complet
      }, 100);
    }
  };

  return (
    <div className="flex justify-center">
      <Button variant="destructive" onClick={handleLogout}>
        Se déconnecter
      </Button>
    </div>
  );
};

export default LogoutButton;
