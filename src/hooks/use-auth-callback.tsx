
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { storeUserSession } from "@/utils/auth";
import { toast } from "@/components/ui/use-toast";

export function useAuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Add a timeout to prevent indefinite loading
        const timeoutId = setTimeout(() => {
          console.error("Auth callback timeout - redirecting to login");
          setError("Timeout durant l'authentification. Veuillez réessayer.");
          navigate("/auth");
        }, 10000); // 10 seconds timeout
        
        // Check the current session to see if the OAuth flow succeeded
        const { data, error } = await supabase.auth.getSession();
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        if (error) {
          throw error;
        }
        
        if (data?.session?.user) {
          console.log("OAuth callback: User authenticated successfully", data.session.user);
          
          // Create user object
          const user = {
            id: data.session.user.id,
            email: data.session.user.email || '',
            name: data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || '',
            profilePicture: data.session.user.user_metadata?.avatar_url || undefined,
            authProvider: (data.session.user.app_metadata.provider || "email") as "google" | "linkedin" | "email"
          };
          
          // Store user in localStorage
          storeUserSession(user);
          
          // Show success message
          toast({
            title: "Connexion réussie",
            description: `Bienvenue, ${user.name} !`,
          });
          
          // Redirect to home page instead of questionnaire
          console.log("Redirecting to home page after OAuth login");
          navigate("/");
        } else {
          console.error("OAuth callback: No session found");
          setError("Aucune session trouvée après l'authentification. Veuillez réessayer.");
          navigate("/auth");
        }
      } catch (e: any) {
        console.error("Error in OAuth callback:", e);
        setError(e.message || "Une erreur s'est produite durant l'authentification.");
        navigate("/auth");
      }
    };

    handleCallback();
  }, [navigate]);

  return { error };
}
