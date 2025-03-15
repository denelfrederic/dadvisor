
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { storeUserSession } from "@/utils/auth";
import { toast } from "@/components/ui/use-toast";

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check the current session to see if the OAuth flow succeeded
        const { data, error } = await supabase.auth.getSession();
        
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
          
          // Redirect to questionnaire
          console.log("Redirecting to questionnaire after OAuth login");
          navigate("/questionnaire");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial p-4">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-dadvisor-blue border-t-transparent rounded-full mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold mb-2">Authentification en cours...</h1>
        <p className="text-muted-foreground">Vous allez être redirigé automatiquement.</p>
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
