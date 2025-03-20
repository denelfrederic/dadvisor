
import { useState, useEffect } from "react";
import { User, getLoggedInUser } from "@/utils/auth";
import { supabase } from "@/integrations/supabase/client";

export function useAuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fonction pour récupérer l'utilisateur depuis localStorage
    const getUserFromLocalStorage = (): User | null => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          return JSON.parse(storedUser);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur depuis localStorage:", error);
      }
      return null;
    };

    // Fonction pour vérifier l'état d'authentification
    const checkAuth = async () => {
      try {
        // Essayer d'abord de récupérer depuis localStorage pour éviter un écran blanc
        const localUser = getUserFromLocalStorage();
        if (localUser) {
          setUser(localUser);
          setIsLoading(false); // Important: mettre fin au chargement même si on vérifie la session plus tard
        }
        
        // Vérifier la session avec Supabase
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData && sessionData.session) {
          // Session valide trouvée
          const sessionUser = sessionData.session.user;
          
          try {
            // Tenter de récupérer l'utilisateur complet
            const currentUser = await getLoggedInUser();
            
            if (currentUser) {
              setUser(currentUser);
              localStorage.setItem('user', JSON.stringify(currentUser));
            } else {
              // Fallback vers les données de base de la session
              const basicUser: User = {
                id: sessionUser.id,
                email: sessionUser.email || "",
                name: sessionUser.email?.split('@')[0] || "",
                authProvider: "email"
              };
              setUser(basicUser);
              localStorage.setItem('user', JSON.stringify(basicUser));
            }
          } catch (error) {
            console.error("Erreur lors de la récupération des données utilisateur:", error);
          }
        } else if (localUser) {
          // Si aucune session n'est trouvée mais qu'un utilisateur local existe,
          // vérifier si cet utilisateur est toujours valide
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            // Session invalide, nettoyer l'utilisateur
            setUser(null);
            localStorage.removeItem('user');
          }
        } else {
          // Aucune session et aucun utilisateur local
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error("Erreur lors de la vérification d'authentification:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Effectuer la vérification initiale
    checkAuth();
    
    // Configurer l'écouteur pour les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("État d'authentification modifié:", event, session);
        
        if (event === 'SIGNED_IN' && session) {
          // Utilisateur connecté
          const userObj: User = {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.email?.split('@')[0] || "",
            authProvider: "email"
          };
          setUser(userObj);
          localStorage.setItem('user', JSON.stringify(userObj));
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          // Utilisateur déconnecté
          setUser(null);
          localStorage.removeItem('user');
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Mise à jour du token - s'assurer que les données utilisateur sont à jour
          const userObj: User = {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.email?.split('@')[0] || "",
            authProvider: "email"
          };
          setUser(userObj);
          localStorage.setItem('user', JSON.stringify(userObj));
        }
      }
    );
    
    // Nettoyer l'abonnement
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading, setUser };
}
