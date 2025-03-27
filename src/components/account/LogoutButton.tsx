
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

/**
 * Composant de bouton de déconnexion
 * Utilise le contexte d'authentification pour assurer une déconnexion complète
 */
const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      // Utiliser la fonction de déconnexion du contexte d'authentification
      await logout();
      navigate("/");
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
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
