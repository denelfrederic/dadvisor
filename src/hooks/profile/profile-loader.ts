
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { LoadProfileParams, ProfileData } from "./types";
import { checkForTemporaryData } from "./temporary-data";

/**
 * Charge les données de profil depuis Supabase ou des données temporaires
 */
export const fetchProfileData = async ({
  userId,
  navigate,
  setProfileData,
  setLoading
}: LoadProfileParams): Promise<void> => {
  // Double-vérification de l'authentification directement depuis Supabase
  const { data: sessionData } = await supabase.auth.getSession();
  const isAuthenticated = !!sessionData.session;
  
  // Cas spécial: administrateur visualisant le profil d'un utilisateur spécifique
  // ou l'utilisateur visualisant son propre profil
  const targetUserId = userId || (isAuthenticated ? sessionData.session?.user.id : null);
  
  console.log("ID utilisateur cible:", targetUserId);
  console.log("Session courante:", sessionData.session);
  
  if (!targetUserId) {
    // Si pas d'utilisateur, vérifier s'il existe des données temporaires
    const tempData = checkForTemporaryData();
    if (tempData) {
      setProfileData(tempData);
      setLoading(false);
      return;
    }
    
    // Aucune donnée trouvée, rediriger vers l'authentification
    toast({
      variant: "destructive",
      title: "Accès refusé",
      description: "Vous devez être connecté pour accéder à cette page."
    });
    navigate("/auth");
    return;
  }

  try {
    setLoading(true);
    const { data, error } = await supabase
      .from('investment_profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (error) {
      console.error("Erreur lors du chargement du profil:", error);
      if (error.code === 'PGRST116') {
        // Si aucun profil n'est trouvé dans la base de données,
        // vérifier s'il existe des données temporaires (uniquement pour l'utilisateur actuel)
        const tempData = checkForTemporaryData();
        if (tempData && !userId) {
          setProfileData(tempData);
          setLoading(false);
          return;
        }
        
        toast({
          variant: "destructive",
          title: "Profil non trouvé",
          description: "Vous n'avez pas encore créé de profil d'investissement."
        });
        
        if (!userId) {
          navigate("/questionnaire");
        }
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger votre profil d'investissement."
        });
      }
      return;
    }

    // Utiliser une assertion de type pour gérer les données JSON
    const profileDataObj = data.profile_data as unknown as {
      analysis: ProfileData["analysis"];
      investmentStyleInsights: string[];
      answers: Record<string, { optionId: string; value: number }>;
    };

    setProfileData({
      score: data.score,
      profileType: data.profile_type,
      analysis: profileDataObj.analysis,
      investmentStyleInsights: profileDataObj.investmentStyleInsights
    });
  } catch (error) {
    console.error("Erreur lors de l'analyse du profil:", error);
    toast({
      variant: "destructive", 
      title: "Erreur",
      description: "Une erreur est survenue lors du chargement de votre profil."
    });
  } finally {
    setLoading(false);
  }
};
