import { supabase } from "@/integrations/supabase/client";
import { User } from "@/utils/auth";
import { InvestorProfileAnalysis } from "@/utils/questionnaire";
import { toast } from "@/components/ui/use-toast";
import { Json } from "@/integrations/supabase/types";
import { QuestionnaireResponses, ProfileDataForDb } from "./types";
import { clearQuestionnaireStorage } from "./storage";
import { NavigateFunction } from "react-router-dom";

export const saveInvestmentProfileToSupabase = async (
  user: User | null,
  profileAnalysis: InvestorProfileAnalysis | null,
  investmentStyleInsights: string[],
  answers: QuestionnaireResponses,
  score: number,
  setSaving: (saving: boolean) => void,
  navigate: NavigateFunction
): Promise<void> => {
  if (!user) {
    toast({
      variant: "destructive",
      title: "Connexion requise",
      description: "Vous devez être connecté pour sauvegarder votre profil d'investisseur."
    });
    navigate("/auth");
    return;
  }

  if (!profileAnalysis) {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Impossible de sauvegarder le profil, analyse non disponible."
    });
    return;
  }

  setSaving(true);
  
  try {
    // Determine profile type
    let profileType = "balanced";
    if (score < 40) profileType = "conservative";
    else if (score >= 70) profileType = "growth";

    // Prepare data for Supabase (with correct typing)
    const profileDataForDb: Json = {
      analysis: profileAnalysis as unknown as Json,
      investmentStyleInsights: investmentStyleInsights as unknown as Json,
      answers: answers as unknown as Json
    };

    // Create data object for saving
    const profileData = {
      user_id: user.id,
      score: Math.round(score),
      profile_type: profileType,
      profile_data: profileDataForDb
    };

    // Check if user already has a profile
    const { data: existingProfile } = await supabase
      .from('investment_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    
    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('investment_profiles')
        .update(profileData)
        .eq('user_id', user.id);
    } else {
      // Create new profile
      result = await supabase
        .from('investment_profiles')
        .insert(profileData);
    }

    if (result.error) {
      throw result.error;
    }

    toast({
      title: "Profil sauvegardé",
      description: "Votre profil d'investisseur a été sauvegardé avec succès."
    });

    // Clear localStorage after successful save
    clearQuestionnaireStorage();

    // Redirect to profile-analysis page instead of profile
    navigate("/profile-analysis");
    
  } catch (error: any) {
    console.error("Error saving investment profile:", error);
    toast({
      variant: "destructive",
      title: "Erreur de sauvegarde",
      description: error.message || "Une erreur est survenue lors de la sauvegarde de votre profil."
    });
  } finally {
    setSaving(false);
  }
};
