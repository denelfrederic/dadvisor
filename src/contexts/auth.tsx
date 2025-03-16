
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define user type
export type User = {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  authProvider: 'google' | 'linkedin' | 'email';
};

// Define auth context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  logout: async () => {},
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored user in localStorage
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Error retrieving user from localStorage:', e);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('user');
        }
        
        checkUser();
      }
    );

    // Initial check
    checkUser();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('user');
    } catch (e) {
      setError('Error signing out');
      console.error('Error signing out:', e);
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
