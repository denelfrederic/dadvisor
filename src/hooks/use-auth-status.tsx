
import { useState, useEffect } from "react";
import { User, getLoggedInUser } from "@/utils/auth";
import { supabase } from "@/integrations/supabase/client";

export function useAuthStatus() {
  const [user, setUser] = useState<User | null>(null);

  // Effet pour vérifier si un utilisateur est connecté
  useEffect(() => {
    const loadUser = async () => {
      // Force refresh from Supabase to ensure we have the latest data
      const currentUser = await getLoggedInUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Si aucun utilisateur trouvé, nettoyer l'état
        setUser(null);
      }
    };
    
    loadUser();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          // Recharger l'utilisateur à chaque changement
          const currentUser = await getLoggedInUser();
          if (currentUser) {
            setUser(currentUser);
          }
        } else if (event === "SIGNED_OUT") {
          // Si un utilisateur se déconnecte, on réinitialise l'état
          setUser(null);
        }
      }
    );

    // Nettoyer l'abonnement
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, setUser };
}
