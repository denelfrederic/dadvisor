
import { useState, useEffect, useCallback } from "react";
import { User } from "@/utils/auth";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook pour gérer l'état d'authentification de l'utilisateur
 * 
 * Fournit l'utilisateur actuel, l'état de chargement et des fonctions pour
 * mettre à jour l'utilisateur.
 */
export function useAuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Récupère l'utilisateur depuis le localStorage
   * Utile pour éviter un écran blanc pendant le chargement initial
   */
  const getUserFromLocalStorage = useCallback((): User | null => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur depuis localStorage:", error);
      return null;
    }
  }, []);

  /**
   * Met à jour l'utilisateur dans le localStorage et l'état
   * Centralise la logique de mise à jour de l'utilisateur
   */
  const updateUserState = useCallback((userData: User | null) => {
    setUser(userData);
    
    if (userData) {
      try {
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de l'utilisateur dans localStorage:", error);
      }
    } else {
      localStorage.removeItem('user');
    }
  }, []);

  /**
   * Crée un objet utilisateur à partir des données de session Supabase
   */
  const createUserFromSession = useCallback((session: any): User => {
    const sessionUser = session.user;
    return {
      id: sessionUser.id,
      email: sessionUser.email || "",
      name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || "",
      profilePicture: sessionUser.user_metadata?.avatar_url,
      authProvider: (sessionUser.app_metadata?.provider || "email") as "google" | "linkedin" | "email"
    };
  }, []);

  /**
   * Vérifie l'état d'authentification auprès de Supabase
   * Gère la récupération de session et la mise à jour de l'état utilisateur
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      // Récupérer d'abord depuis localStorage pour un chargement rapide
      const localUser = getUserFromLocalStorage();
      if (localUser) {
        setUser(localUser);
      }

      // Vérifier la session avec Supabase
      const { data: sessionData, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Erreur lors de la récupération de la session:", error);
        updateUserState(null);
        return;
      }
      
      if (sessionData?.session) {
        // Session valide trouvée
        const userData = createUserFromSession(sessionData.session);
        console.log("Session valide trouvée:", userData);
        updateUserState(userData);
      } else if (localUser) {
        // Si aucune session n'est trouvée mais qu'un utilisateur local existe,
        // vérifier si cet utilisateur est toujours valide ou supprimer les données
        console.log("Aucune session active trouvée, mais utilisateur local présent");
        updateUserState(null);
      } else {
        // Aucune session et aucun utilisateur local
        console.log("Aucune session active ni utilisateur local");
        updateUserState(null);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification d'authentification:", error);
      updateUserState(null);
    } finally {
      setIsLoading(false);
    }
  }, [getUserFromLocalStorage, updateUserState, createUserFromSession]);

  // Effectuer la vérification initiale et configurer les écouteurs d'événements
  useEffect(() => {
    // Configuration de l'écouteur pour les changements d'état d'authentification
    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log("État d'authentification modifié:", event);
          
          if (session) {
            // Utilisateur connecté ou token actualisé
            const userData = createUserFromSession(session);
            updateUserState(userData);
          } else if (event === 'SIGNED_OUT') {
            // Utilisateur déconnecté
            updateUserState(null);
          }
          
          // Toujours mettre fin au chargement après un événement d'authentification
          setIsLoading(false);
        }
      );
      
      return subscription;
    };

    // Configurer l'écouteur
    const subscription = setupAuthListener();
    
    // Vérifier l'état actuel de l'authentification
    checkAuthStatus();
    
    // Nettoyer l'abonnement lors du démontage
    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuthStatus, createUserFromSession, updateUserState]);

  return { user, isLoading, setUser: updateUserState };
}
