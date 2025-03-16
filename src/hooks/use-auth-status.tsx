
import { useState, useEffect } from "react";
import { User, getLoggedInUser } from "@/utils/auth";
import { supabase } from "@/integrations/supabase/client";

export function useAuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Check using Supabase session first
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData && sessionData.session) {
          console.log("Session found:", sessionData.session.user);
          // Try to get the complete user data
          const currentUser = await getLoggedInUser();
          
          if (currentUser) {
            setUser(currentUser);
          } else {
            // If getLoggedInUser fails but we have a session, create a basic user
            const sessionUser = sessionData.session.user;
            setUser({
              id: sessionUser.id,
              email: sessionUser.email || "",
              name: sessionUser.email?.split('@')[0] || "",
              authProvider: "email"
            });
          }
        } else {
          console.log("No session found");
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session);
        if (event === 'SIGNED_IN' && session) {
          // Update user on sign in
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.email?.split('@')[0] || "",
            authProvider: "email"
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading, setUser };
}
