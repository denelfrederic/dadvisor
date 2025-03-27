
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

/**
 * Composant de bouton de déconnexion
 * Utilise le contexte d'authentification pour assurer une déconnexion complète
 * Amélioré pour une meilleure gestion des erreurs en production
 */
const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      // Utiliser la fonction de déconnexion du contexte d'authentification
      await logout();
      
      // Force la navigation APRÈS la déconnexion
      setTimeout(() => {
        navigate("/");
        toast.success("Déconnexion réussie");
      }, 100);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
      
      // En cas d'erreur, forcer la navigation et nettoyer localement
      setTimeout(() => {
        navigate("/");
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
