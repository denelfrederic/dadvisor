
import { useNavigate } from "react-router-dom";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { saveInvestmentProfileToSupabase } from "../saveProfile";

/**
 * Props pour le hook useQuestionnaireSaving
 */
interface UseQuestionnaireSavingProps {
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Hook personnalisé pour les opérations de sauvegarde des résultats du questionnaire
 */
export const useQuestionnaireSaving = ({
  setSaving
}: UseQuestionnaireSavingProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStatus();
  
  /**
   * Sauvegarde le profil d'investissement dans Supabase
   * @param profileAnalysis Analyse du profil
   * @param investmentStyleInsights Insights sur le style d'investissement
   * @param answers Réponses au questionnaire
   * @param score Score calculé
   */
  const saveInvestmentProfile = async (
    profileAnalysis: any, 
    investmentStyleInsights: string[], 
    answers: any, 
    score: number
  ) => {
    await saveInvestmentProfileToSupabase(
      user,
      profileAnalysis,
      investmentStyleInsights,
      answers,
      score,
      setSaving,
      navigate
    );
  };
  
  return {
    saveInvestmentProfile
  };
};
