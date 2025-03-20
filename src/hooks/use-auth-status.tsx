
import { useState, useEffect } from "react";
import { User, getLoggedInUser } from "@/utils/auth";
import { supabase } from "@/integrations/supabase/client";

export function useAuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // D'abord essayer de récupérer l'utilisateur du localStorage pour éviter un flash d'écran blanc
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (err) {
          console.error("Erreur lors de la récupération de l'utilisateur depuis localStorage:", err);
        }
        
        // Vérifier ensuite la session Supabase pour confirmer l'authenticité
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData && sessionData.session) {
          console.log("Session trouvée:", sessionData.session.user);
          // Essayer d'obtenir les données complètes de l'utilisateur
          const currentUser = await getLoggedInUser();
          
          if (currentUser) {
            setUser(currentUser);
            // Mettre à jour le localStorage avec les données les plus récentes
            localStorage.setItem('user', JSON.stringify(currentUser));
          } else {
            // Si getLoggedInUser échoue mais qu'une session existe, créer un utilisateur de base
            const sessionUser = sessionData.session.user;
            const basicUser = {
              id: sessionUser.id,
              email: sessionUser.email || "",
              name: sessionUser.email?.split('@')[0] || "",
              authProvider: "email"
            };
            setUser(basicUser);
            localStorage.setItem('user', JSON.stringify(basicUser));
          }
        } else {
          console.log("Aucune session trouvée");
          // Si aucune session n'est trouvée, s'assurer que l'utilisateur est déconnecté
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du statut d'authentification:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
    
    // Configurer l'écouteur d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("État d'authentification modifié:", event, session);
        if (event === 'SIGNED_IN' && session) {
          // Mettre à jour l'utilisateur lors de la connexion
          const userObj = {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.email?.split('@')[0] || "",
            authProvider: "email"
          };
          setUser(userObj);
          localStorage.setItem('user', JSON.stringify(userObj));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('user');
        }
        setIsLoading(false);
      }
    );
    
    // Nettoyer l'abonnement
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading, setUser };
}
