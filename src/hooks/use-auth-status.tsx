
import { useState, useEffect } from "react";
import { User, getLoggedInUser } from "@/utils/auth";
import { supabase } from "@/integrations/supabase/client";

export function useAuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Effect to check if a user is logged in
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        console.log("Checking authentication status...");
        
        // Check Supabase session directly
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setUser(null);
          return;
        }
        
        if (!sessionData.session) {
          console.log("No active session found");
          setUser(null);
          return;
        }
        
        console.log("Active session found:", sessionData.session.user);
        
        // Try to get complete user data
        const currentUser = await getLoggedInUser();
        
        if (currentUser) {
          console.log("User data successfully loaded:", currentUser);
          setUser(currentUser);
        } else {
          // If getLoggedInUser fails but we have a session, create minimal user
          const sessionUser = sessionData.session.user;
          
          // Safely extract name from email
          let emailName = "User";
          if (sessionUser.email) {
            const emailParts = sessionUser.email.split('@');
            emailName = emailParts[0] || "User";
          }
          
          const fallbackUser: User = {
            id: sessionUser.id,
            email: sessionUser.email || "",
            name: emailName,
            authProvider: (sessionUser.app_metadata?.provider as any) || "email"
          };
          console.log("Using fallback user data:", fallbackUser);
          setUser(fallbackUser);
        }
      } catch (error) {
        console.error("Critical error loading user:", error);
        setUser(null);
      } finally {
        // Always set loading to false to prevent infinite loading
        setLoading(false);
      }
    };
    
    // Initial load
    loadUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session);
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          try {
            // Reload user on each change
            if (session) {
              const currentUser = await getLoggedInUser();
              if (currentUser) {
                console.log("User updated after auth change:", currentUser);
                setUser(currentUser);
              } else {
                // Fallback to session data with better handling of emails
                const sessionUser = session.user;
                
                // Safely extract name from email
                let emailName = "User";
                if (sessionUser.email) {
                  const emailParts = sessionUser.email.split('@');
                  emailName = emailParts[0] || "User";
                }
                
                const fallbackUser: User = {
                  id: sessionUser.id,
                  email: sessionUser.email || "",
                  name: emailName,
                  authProvider: (sessionUser.app_metadata?.provider as any) || "email"
                };
                console.log("Using fallback user data after auth change:", fallbackUser);
                setUser(fallbackUser);
              }
            }
          } catch (error) {
            console.error("Error updating user after auth change:", error);
          }
          // Make sure loading is false even when signed in
          setLoading(false);
        } else if (event === "SIGNED_OUT") {
          // If a user logs out, reset the state
          console.log("User signed out");
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, setUser, loading };
}
