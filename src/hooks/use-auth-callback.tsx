
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
        console.log("Traitement du callback d'authentification OAuth ou Magic Link...");
        console.log("URL actuelle:", window.location.href);
        
        // Add a timeout to prevent indefinite loading
        const timeoutId = setTimeout(() => {
          console.error("Auth callback timeout - redirecting to login");
          setError("Timeout durant l'authentification. Veuillez réessayer.");
          navigate("/auth");
        }, 15000); // 15 seconds timeout
        
        // Check the current session to see if the OAuth or Magic Link flow succeeded
        const { data, error } = await supabase.auth.getSession();
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        if (error) {
          console.error("Erreur lors de la récupération de la session:", error);
          throw error;
        }
        
        if (data?.session?.user) {
          console.log("Callback: Utilisateur authentifié avec succès", data.session.user);
          
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
          
          // Redirect to home page
          console.log("Redirection vers la page d'accueil après authentification");
          navigate("/");
        } else {
          console.error("Callback: Aucune session trouvée");
          setError("Aucune session trouvée après l'authentification. Veuillez réessayer.");
          navigate("/auth");
        }
      } catch (e: any) {
        console.error("Erreur dans le processus d'authentification:", e);
        setError(e.message || "Une erreur s'est produite durant l'authentification.");
        navigate("/auth");
      }
    };

    handleCallback();
  }, [navigate]);

  return { error };
}
