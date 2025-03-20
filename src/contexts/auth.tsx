
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
  const { user, isLoading } = useAuthStatus();
  const [error, setError] = useState<string | null>(null);

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('user');
    } catch (e) {
      setError('Erreur lors de la déconnexion');
      console.error('Erreur lors de la déconnexion:', e);
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
