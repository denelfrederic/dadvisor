
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Définir le type d'utilisateur
export type User = {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  authProvider: 'google' | 'linkedin' | 'email';
};

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier la session Supabase et l'utilisateur stocké
    const checkUser = async () => {
      try {
        // D'abord vérifier le localStorage pour un chargement rapide
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (e) {
          console.error('Erreur lors de la récupération de l\'utilisateur depuis localStorage:', e);
        }
        
        // Vérifier la session Supabase pour valider l'authentification
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Si pas de session valide, s'assurer que l'utilisateur est déconnecté
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (e) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', e);
      } finally {
        setIsLoading(false);
      }
    };

    // Configurer l'écouteur d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('user');
        }
      }
    );

    // Vérification initiale
    checkUser();

    // Nettoyer l'abonnement
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fonction de déconnexion
  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('user');
    } catch (e) {
      setError('Erreur lors de la déconnexion');
      console.error('Erreur lors de la déconnexion:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
