
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

  // Fonction de déconnexion optimisée pour la production
  const logout = async () => {
    try {
      console.log("Tentative de déconnexion complète...");
      
      // 1. PREMIÈRE ÉTAPE: Nettoyer l'état local immédiatement
      setUser(null);
      
      // 2. Nettoyer TOUS les éléments de stockage local utilisateur
      // Liste étendue des clés à supprimer pour garantir un nettoyage complet
      const keysToRemove = [
        'user', 
        'dadvisor_user', 
        'supabase.auth.token',
        'sb-zbiyxrzbqisamabxkeqg-auth-token',
        'supabase.auth.refreshToken',
        'supabase.auth.accessToken'
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch (e) {
          console.warn(`Erreur lors de la suppression de ${key}:`, e);
        }
      });
      
      // 3. Recherche et suppression de toutes les clés liées à Supabase
      try {
        // Identification et suppression de tous les éléments liés à Supabase dans localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
              key.includes('supabase') || 
              key.includes('sb-') || 
              key.includes('auth') || 
              key.includes('token') ||
              key.includes('user')
          )) {
            console.log("Suppression de localStorage:", key);
            localStorage.removeItem(key);
          }
        }
        
        // Identification et suppression de tous les éléments liés à Supabase dans sessionStorage
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (
              key.includes('supabase') || 
              key.includes('sb-') || 
              key.includes('auth') || 
              key.includes('token') ||
              key.includes('user')
          )) {
            console.log("Suppression de sessionStorage:", key);
            sessionStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.warn("Erreur lors de la suppression des clés Supabase:", e);
      }
      
      // 4. Appeler les API de déconnexion avec gestion timeout améliorée
      try {
        // Timeout plus court (1.5 secondes) pour abandonner l'appel si Supabase ne répond pas
        const timeoutPromise = new Promise<void>((resolve) => {
          setTimeout(() => {
            console.log("Timeout de déconnexion Supabase atteint, continuant...");
            resolve();
          }, 1500);
        });
        
        // Utiliser Promise.race pour limiter le temps d'attente de l'appel Supabase
        await Promise.race([
          // Convertir le résultat de signOut en Promise<void> pour la compatibilité avec timeoutPromise
          supabase.auth.signOut().then(() => {
            console.log("Déconnexion Supabase réussie");
          }).catch(e => {
            console.warn("Erreur ignorée lors de l'appel signOut:", e);
          }),
          timeoutPromise
        ]);
      } catch (e) {
        console.error("Erreur lors de l'appel de déconnexion:", e);
        // Ne pas propager l'erreur, continuer le processus
      }
      
      // 5. Nettoyage final pour s'assurer que tout est propre
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch (e) {
          // Ignorer les erreurs ici
        }
      });
      
      console.log("Processus de déconnexion terminé avec succès");
      
    } catch (e) {
      console.error('Erreur détaillée lors de la déconnexion:', e);
      setError('Erreur lors de la déconnexion');
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
