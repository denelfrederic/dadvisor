
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
  try {
    setLoading(true);
    
    // Double-vérification de l'authentification directement depuis Supabase
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticated = !!sessionData.session;
    
    // Cas spécial: administrateur visualisant le profil d'un utilisateur spécifique
    // ou l'utilisateur visualisant son propre profil
    const targetUserId = userId || (isAuthenticated ? sessionData.session?.user.id : null);
    
    console.log("fetchProfileData - ID utilisateur cible:", targetUserId);
    console.log("fetchProfileData - Session courante:", sessionData.session);
    
    // Log du flux de contrôle pour diagnostic
    console.log("fetchProfileData - Flux de contrôle: Début du chargement");
    
    // Vérifier d'abord s'il existe des données temporaires (pour les utilisateurs connectés ou non)
    const tempData = checkForTemporaryData();
    console.log("fetchProfileData - Données temporaires trouvées:", !!tempData);
    
    // Variable pour stocker les données de profil de la base de données
    let dbProfileData = null;
    
    // Si l'utilisateur est connecté, essayer de récupérer son profil depuis la base de données
    if (targetUserId) {
      console.log("fetchProfileData - Tentative de récupération du profil depuis la base de données");
      
      const { data, error } = await supabase
        .from('investment_profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (data) {
        // Profil trouvé dans la base de données
        console.log("fetchProfileData - Profil trouvé dans la base de données:", data);
        
        // Utiliser une assertion de type pour gérer les données JSON
        const profileDataObj = data.profile_data as unknown as {
          analysis: ProfileData["analysis"];
          investmentStyleInsights: string[];
          answers: Record<string, { optionId: string; value: number }>;
        };

        dbProfileData = {
          score: data.score,
          profileType: data.profile_type,
          analysis: profileDataObj.analysis,
          investmentStyleInsights: profileDataObj.investmentStyleInsights
        };
      } else if (error && error.code !== 'PGRST116') {
        // Erreur autre que "no rows returned"
        console.error("fetchProfileData - Erreur lors du chargement du profil:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger votre profil d'investissement."
        });
        setLoading(false);
        return;
      }
    }
    
    // Décider quelles données utiliser en priorité
    if (dbProfileData) {
      console.log("fetchProfileData - Utilisation des données de la base de données");
      setProfileData(dbProfileData);
      setLoading(false);
      return;
    } else if (tempData) {
      console.log("fetchProfileData - Utilisation des données temporaires");
      setProfileData(tempData);
      setLoading(false);
      return;
    }
    
    // Aucune donnée trouvée, ni dans la base ni temporaire
    console.log("fetchProfileData - Aucun profil trouvé, redirection vers le questionnaire");
    toast({
      title: "Profil non trouvé",
      description: "Vous n'avez pas encore créé de profil d'investissement."
    });
    
    // Rediriger vers le questionnaire
    navigate("/questionnaire");
    
  } catch (error) {
    console.error("fetchProfileData - Erreur lors de l'analyse du profil:", error);
    toast({
      variant: "destructive", 
      title: "Erreur",
      description: "Une erreur est survenue lors du chargement de votre profil."
    });
  } finally {
    setLoading(false);
  }
};
