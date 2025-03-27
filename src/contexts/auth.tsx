
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/utils/auth';
import { useAuthStatus } from '@/hooks/use-auth-status';

// Définir le type de contexte d'authentification
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
};

// Créer le contexte avec des valeurs par défaut
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  logout: async () => {},
});

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Composant fournisseur d'authentification
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading, setUser } = useAuthStatus();
  const [error, setError] = useState<string | null>(null);

  // Fonction de déconnexion améliorée pour résoudre les problèmes en production
  const logout = async () => {
    try {
      console.log("Tentative de déconnexion...");
      
      // 1. Nettoyer TOUS les éléments de stockage local utilisateur
      // Méthode défensive: supprimer tout élément susceptible de contenir des infos de session
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
      
      // 2. Forcer l'effacement de tout le localStorage et sessionStorage lié à Supabase
      try {
        // Identifie et supprime tous les éléments qui pourraient être liés à Supabase
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('supabase') || key.includes('sb-'))) {
            localStorage.removeItem(key);
          }
        }
        
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.includes('supabase') || key.includes('sb-'))) {
            sessionStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.warn("Erreur lors de la suppression des clés Supabase:", e);
      }
      
      // 3. Mettre à jour l'état interne AVANT l'appel à Supabase
      setUser(null);
      
      // 4. Appeler la déconnexion Supabase avec un délai de timeout
      const timeoutPromise = new Promise<{error: Error | null}>((resolve) => {
        setTimeout(() => resolve({error: null}), 2000);
      });
      
      // Race entre la déconnexion Supabase et un timeout
      const result = await Promise.race([
        supabase.auth.signOut(),
        timeoutPromise
      ]);
      
      if (result.error) {
        console.error("Erreur Supabase lors de la déconnexion:", result.error);
        // On ne lance pas l'erreur, on continue
      }
      
      console.log("Déconnexion réussie côté client");
      
      // 5. Dernier nettoyage après signOut pour s'assurer que tout est propre
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch (e) {
          // Ignorer les erreurs ici
        }
      });
      
    } catch (e) {
      console.error('Erreur détaillée lors de la déconnexion:', e);
      setError('Erreur lors de la déconnexion');
      // Ne pas propager l'erreur pour permettre la navigation
    }
  };

  // Ajouter des logs pour déboguer
  useEffect(() => {
    console.log("AuthProvider - État actuel:", { user, isLoading, error });
  }, [user, isLoading, error]);

  // Le contexte utilise maintenant directement les données du hook useAuthStatus
  return (
    <AuthContext.Provider value={{ user, isLoading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
