
import { useNavigate } from "react-router-dom";
import { questions } from "@/utils/questionnaire";
import { QuestionnaireResponses } from "../types";

/**
 * Props pour le hook useQuestionnaireNavigation
 */
interface UseQuestionnaireNavigationProps {
  score: number;
  answers: QuestionnaireResponses;
}

/**
 * Hook personnalisé pour la navigation entre les pages du questionnaire
 */
export const useQuestionnaireNavigation = ({
  score,
  answers
}: UseQuestionnaireNavigationProps) => {
  const navigate = useNavigate();
  
  /**
   * Redirige vers la page des portefeuilles avec les données du profil
   */
  const handleContinueToPortfolios = () => {
    console.log("Redirection vers les portefeuilles avec:", {
      score,
      answers
    });
    
    // Enrichir les réponses avec le texte des options sélectionnées
    const enrichedAnswers = { ...answers };
    
    // S'assurer que answers est bien défini
    if (enrichedAnswers) {
      Object.keys(enrichedAnswers).forEach(questionId => {
        const question = questions.find(q => q.id === questionId);
        if (question) {
          const option = question.options.find(opt => opt.id === enrichedAnswers[questionId]?.optionId);
          if (option) {
            enrichedAnswers[questionId] = {
              ...enrichedAnswers[questionId],
              text: option.text
            };
          }
        }
      });
    }
    
    // Enregistrer les réponses enrichies dans le localStorage pour une utilisation ultérieure
    localStorage.setItem('dadvisor_temp_answers', JSON.stringify(enrichedAnswers));
    
    // Transmettre à la fois le score et les réponses au questionnaire
    navigate("/portfolios", { state: { score, answers: enrichedAnswers } });
  };
  
  return {
    handleContinueToPortfolios
  };
};
