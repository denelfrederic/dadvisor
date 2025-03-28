
import { useState, useEffect } from "react";
import { User } from "@/utils/auth";
import { fetchProfileData } from "./profile/profile-loader";
import { saveProfile } from "./profile/profile-saver";
import { hasTempData } from "./profile/temporary-data";
import { ProfileData, ProfileCheckResult } from "./profile/types";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * Hook pour gérer les données de profil d'investisseur
 */
export function useProfileData(user: User | null): ProfileCheckResult {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get('userId');
  
  // Fonction pour naviguer (utilisée dans les fonctions de chargement et sauvegarde)
  const navigateTo = (path: string) => {
    navigate(path);
  };

  // Charger les données de profil au montage du composant
  useEffect(() => {
    const targetUserId = userIdParam || user?.id;
    fetchProfileData({
      userId: targetUserId,
      navigate: navigateTo,
      setProfileData,
      setLoading
    });
  }, [user, navigate, userIdParam]);

  return {
    loading,
    profileData,
    hasTempData: hasTempData(),
    saveProfile: () => saveProfile(user, profileData, navigateTo),
    handleRetakeQuestionnaire: () => {
      // Supprimer les données temporaires avant de recommencer
      localStorage.removeItem("dadvisor_temp_answers");
      localStorage.removeItem("dadvisor_temp_score");
      localStorage.removeItem("dadvisor_temp_complete");
      navigate("/questionnaire");
    }
  };
}
