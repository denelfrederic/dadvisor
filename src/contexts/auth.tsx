
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
      
      // 1. D'abord nettoyer le localStorage pour s'assurer que toutes les données utilisateur sont supprimées
      localStorage.removeItem('user');
      localStorage.removeItem('dadvisor_user');
      localStorage.removeItem('supabase.auth.token');
      
      // 2. Mettre à jour l'état interne avant l'appel à Supabase 
      // pour éviter les tentatives d'accès avec une session invalide
      setUser(null);
      
      // 3. Appeler la déconnexion Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erreur Supabase lors de la déconnexion:", error);
        throw error;
      }
      
      console.log("Déconnexion réussie");
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
