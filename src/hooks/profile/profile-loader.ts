
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
  
  try {
    setLoading(true);
    
    // Vérifier d'abord s'il existe des données temporaires (pour les utilisateurs connectés ou non)
    const tempData = checkForTemporaryData();
    
    // Si l'utilisateur est connecté, essayer de récupérer son profil depuis la base de données
    if (targetUserId) {
      const { data, error } = await supabase
        .from('investment_profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (data) {
        // Profil trouvé dans la base de données
        console.log("Profil trouvé dans la base de données:", data);
        
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
        
        setLoading(false);
        return;
      } else if (error && error.code !== 'PGRST116') {
        // Erreur autre que "no rows returned"
        console.error("Erreur lors du chargement du profil:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger votre profil d'investissement."
        });
        setLoading(false);
        return;
      }
      
      // Si on arrive ici, c'est qu'aucun profil n'a été trouvé pour l'utilisateur connecté
      console.log("Aucun profil trouvé dans la base de données pour l'utilisateur connecté");
    }
    
    // Si on n'a pas trouvé de profil dans la base de données, utiliser les données temporaires
    if (tempData) {
      console.log("Utilisation des données temporaires de profil");
      setProfileData(tempData);
      setLoading(false);
      return;
    }
    
    // Aucune donnée trouvée, ni dans la base ni temporaire
    console.log("Aucun profil trouvé, redirection vers le questionnaire");
    toast({
      title: "Profil non trouvé",
      description: "Vous n'avez pas encore créé de profil d'investissement."
    });
    
    // Rediriger vers le questionnaire
    navigate("/questionnaire");
    
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
