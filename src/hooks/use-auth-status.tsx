
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
        // Force refresh from Supabase to ensure we have the latest data
        const currentUser = await getLoggedInUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // If no user found, clean up the state
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading user:", error);
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
          // Reload user on each change
          const currentUser = await getLoggedInUser();
          if (currentUser) {
            setUser(currentUser);
          }
          // Make sure loading is false even when signed in
          setLoading(false);
        } else if (event === "SIGNED_OUT") {
          // If a user logs out, reset the state
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
