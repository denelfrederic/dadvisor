
import { toast } from "@/components/ui/use-toast";
import { TEMP_ANSWERS_KEY, TEMP_SCORE_KEY, TEMP_COMPLETE_KEY } from "@/contexts/questionnaire/types";
import { getInvestorProfileAnalysis, analyzeInvestmentStyle } from "@/utils/questionnaire";
import { ProfileData } from "./types";

/**
 * Vérifie s'il existe des données temporaires de profil
 * @returns Les données de profil temporaires ou false si aucune trouvée
 */
export const checkForTemporaryData = (): ProfileData | false => {
  const savedAnswers = localStorage.getItem(TEMP_ANSWERS_KEY);
  const savedScore = localStorage.getItem(TEMP_SCORE_KEY);
  const savedComplete = localStorage.getItem(TEMP_COMPLETE_KEY);
  
  if (savedAnswers && savedScore && savedComplete) {
    try {
      const answers = JSON.parse(savedAnswers);
      const score = JSON.parse(savedScore);
      const isComplete = JSON.parse(savedComplete);
      
      if (isComplete && Object.keys(answers).length > 0) {
        const analysis = getInvestorProfileAnalysis(score, answers);
        const insights = analyzeInvestmentStyle(answers);
        
        let profileType = "balanced";
        if (score < 40) profileType = "conservative";
        else if (score >= 70) profileType = "growth";
        
        toast({
          title: "Profil temporaire chargé",
          description: "Votre profil n'est pas encore sauvegardé. Vous pouvez le faire depuis cette page."
        });
        
        return {
          score,
          profileType,
          analysis,
          investmentStyleInsights: insights
        };
      }
    } catch (e) {
      console.error("Erreur lors de l'analyse des données temporaires:", e);
    }
  }
  return false;
};

/**
 * Nettoie les données temporaires du localStorage
 */
export const clearTemporaryData = (): void => {
  localStorage.removeItem(TEMP_ANSWERS_KEY);
  localStorage.removeItem(TEMP_SCORE_KEY);
  localStorage.removeItem(TEMP_COMPLETE_KEY);
};

/**
 * Vérifie si des données temporaires existent dans le localStorage
 */
export const hasTempData = (): boolean => {
  return Boolean(localStorage.getItem(TEMP_ANSWERS_KEY));
};
