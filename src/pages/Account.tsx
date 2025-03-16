
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, getLoggedInUser } from "@/utils/auth";
import EmailUpdateForm from "@/components/account/EmailUpdateForm";
import PasswordUpdateForm from "@/components/account/PasswordUpdateForm";
import LogoutButton from "@/components/account/LogoutButton";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { UserRound, BarChartBig } from "lucide-react";

const Account = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour forcer la mise à jour des données utilisateur
  const refreshUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Vérifier directement la session Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Erreur lors de la récupération de la session:", sessionError);
        setError("Impossible de récupérer votre session. Veuillez vous reconnecter.");
        toast.error("Erreur de session. Veuillez vous reconnecter.");
        navigate("/auth");
        return;
      }
      
      if (!sessionData.session) {
        console.log("Aucune session active trouvée");
        setError("Aucune session active trouvée. Veuillez vous reconnecter.");
        toast.error("Session expirée. Veuillez vous reconnecter.");
        navigate("/auth");
        return;
      }
      
      console.log("Session active trouvée:", sessionData.session.user);
      
      // Récupérer les informations utilisateur complètes
      const currentUser = await getLoggedInUser();
      if (currentUser) {
        console.log("Informations utilisateur récupérées:", currentUser);
        setUser(currentUser);
      } else {
        // Si getLoggedInUser échoue mais que nous avons une session, créer un utilisateur minimal
        const sessionUser = sessionData.session.user;
        const fallbackUser: User = {
          id: sessionUser.id,
          email: sessionUser.email || "",
          name: sessionUser.email?.split('@')[0] || "Utilisateur",
          authProvider: (sessionUser.app_metadata?.provider as any) || "email"
        };
        console.log("Utilisation des données de secours:", fallbackUser);
        setUser(fallbackUser);
      }
    } catch (error) {
      console.error("Erreur critique lors du rafraîchissement des données utilisateur:", error);
      setError("Une erreur s'est produite lors du chargement de vos informations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    refreshUserData();
  }, [navigate]);

  const handleViewProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-16 max-w-3xl">
      <h1 className="text-3xl font-bold text-dadvisor-navy mb-8">Gestion de compte</h1>
      
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin h-8 w-8 border-4 border-dadvisor-blue border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-medium">Erreur</p>
          <p>{error}</p>
        </div>
      )}
      
      {!loading && user && (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-16 w-16">
                {user.profilePicture ? (
                  <AvatarImage src={user.profilePicture} alt={user.name} />
                ) : (
                  <AvatarFallback className="bg-dadvisor-lightblue text-dadvisor-navy text-xl">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Connexion via: {user.authProvider === "google" ? "Google" : 
                               user.authProvider === "linkedin" ? "LinkedIn" : "Email"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Nouveau bouton pour accéder au profil d'investisseur */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-dadvisor-navy mb-4 flex items-center gap-2">
              <BarChartBig className="h-5 w-5" />
              Mon profil d'investisseur
            </h2>
            <p className="text-muted-foreground mb-4">
              Consultez votre profil d'investisseur basé sur vos réponses au questionnaire.
            </p>
            <Button 
              onClick={handleViewProfile}
              className="w-full md:w-auto"
            >
              Voir mon profil d'investisseur
            </Button>
          </div>
          
          <EmailUpdateForm user={user} refreshUserData={refreshUserData} />
          
          {user.authProvider === "email" && <PasswordUpdateForm />}
          
          <Separator className="my-8" />
          
          <LogoutButton />
        </>
      )}
    </div>
  );
};

export default Account;
