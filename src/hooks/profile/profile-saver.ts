
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/utils/auth";
import { toast } from "@/components/ui/use-toast";
import { ProfileData } from "./types";
import { clearTemporaryData } from "./temporary-data";
import { Json } from "@/integrations/supabase/types";
import { TEMP_ANSWERS_KEY } from "@/contexts/questionnaire/types";

/**
 * Sauvegarde le profil d'investisseur dans Supabase
 */
export const saveProfile = async (
  user: User | null,
  profileData: ProfileData | null,
  navigate: (path: string) => void
): Promise<void> => {
  if (!user) {
    // Double-vérification de l'authentification
    const { data: sessionData } = await supabase.auth.getSession();
    const isAuthenticated = !!sessionData.session;
    
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Connexion requise",
        description: "Vous devez être connecté pour sauvegarder votre profil."
      });
      navigate("/auth");
      return;
    }
  }

  if (!profileData) return;

  try {
    const savedAnswers = localStorage.getItem(TEMP_ANSWERS_KEY);
    if (!savedAnswers) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Données du questionnaire non trouvées."
      });
      return;
    }

    const answers = JSON.parse(savedAnswers);
    
    // Obtenir l'ID utilisateur le plus récent de la session
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = user?.id || sessionData.session?.user.id;
    
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Connexion requise",
        description: "Impossible d'identifier votre compte. Veuillez vous reconnecter."
      });
      navigate("/auth");
      return;
    }
    
    // Convertir les objets complexes en type Json pour Supabase
    const profileDataForDb: Json = {
      analysis: profileData.analysis as unknown as Json,
      investmentStyleInsights: profileData.investmentStyleInsights as unknown as Json,
      answers: answers as unknown as Json
    };

    // Créer l'objet de données pour la sauvegarde
    const profileDataToSave = {
      user_id: userId,
      score: Math.round(profileData.score),
      profile_type: profileData.profileType,
      profile_data: profileDataForDb
    };

    const { error } = await supabase
      .from('investment_profiles')
      .insert(profileDataToSave);

    if (error) throw error;

    toast({
      title: "Profil sauvegardé",
      description: "Votre profil d'investisseur a été sauvegardé avec succès."
    });

    // Nettoyer le localStorage après une sauvegarde réussie
    clearTemporaryData();

    // Recharger la page pour afficher les données sauvegardées
    window.location.reload();
  } catch (error: any) {
    console.error("Erreur lors de la sauvegarde du profil:", error);
    toast({
      variant: "destructive",
      title: "Erreur de sauvegarde",
      description: error.message || "Une erreur est survenue lors de la sauvegarde de votre profil."
    });
  }
};
