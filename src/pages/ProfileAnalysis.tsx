
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useAuthStatus } from "@/hooks/use-auth-status";
import ProfileContent from "@/components/profile/ProfileContent";
import ProfileEmptyState from "@/components/profile/ProfileEmptyState";
import ProfileLoading from "@/components/profile/ProfileLoading";
import { useProfileData } from "@/hooks/use-profile-data";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/utils/auth";
import Navbar from "@/components/Navbar";

const ProfileAnalysis = () => {
  const { user: authUser } = useAuthStatus();
  const [directSessionUser, setDirectSessionUser] = useState<User | null>(null);
  
  // Double-check authentication directly with Supabase
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const sessionUser = data.session.user;
        setDirectSessionUser({
          id: sessionUser.id,
          email: sessionUser.email || "",
          name: sessionUser.email?.split('@')[0] || "",
          authProvider: "email" 
        });
      }
    };
    
    checkSession();
  }, []);
  
  // Use either the auth context user or the direct session user
  const user = authUser || directSessionUser;
  
  const { 
    loading, 
    profileData, 
    hasTempData, 
    saveProfile, 
    handleRetakeQuestionnaire 
  } = useProfileData(user);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-radial py-20 px-4 pt-28">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Votre profil d'investisseur</h1>
            <Button variant="outline" asChild className="flex items-center gap-2">
              <Link to="/">
                <Home size={18} />
                Accueil
              </Link>
            </Button>
          </div>

          {loading ? (
            <ProfileLoading />
          ) : profileData ? (
            <ProfileContent 
              profileData={profileData}
              hasTempProfile={hasTempData}
              handleRetakeQuestionnaire={handleRetakeQuestionnaire}
              handleSaveProfile={saveProfile}
              navigate={path => window.location.href = path}
              isLoggedIn={!!user}
            />
          ) : (
            <ProfileEmptyState navigate={path => window.location.href = path} />
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileAnalysis;
