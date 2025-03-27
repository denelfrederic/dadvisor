
import { questions } from "@/utils/questionnaire";
import { QuestionnaireResponses } from "../types";
import { calculateRiskScore } from "@/utils/questionnaire";

/**
 * Props pour le hook useQuestionnaireAnalysis
 */
interface UseQuestionnaireAnalysisProps {
  answers: QuestionnaireResponses;
  setAnswers: React.Dispatch<React.SetStateAction<QuestionnaireResponses>>;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  setPreviousScore: React.Dispatch<React.SetStateAction<number>>;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setIsComplete: React.Dispatch<React.SetStateAction<boolean>>;
  setShowIntroduction: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAnalysis: React.Dispatch<React.SetStateAction<boolean>>;
  clearStorage: () => void;
}

/**
 * Hook personnalisé pour l'analyse des réponses au questionnaire
 */
export const useQuestionnaireAnalysis = ({
  answers,
  setAnswers,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  setPreviousScore,
  setScore,
  setIsComplete,
  setShowIntroduction,
  setShowAnalysis,
  clearStorage
}: UseQuestionnaireAnalysisProps) => {
  
  /**
   * Enrichit les réponses avec le texte correspondant aux options sélectionnées
   * @param answersToEnrich Réponses à enrichir
   */
  const enrichResponsesWithText = (answersToEnrich: QuestionnaireResponses) => {
    // Vérifier si answersToEnrich est défini
    if (!answersToEnrich) return;
    
    // Ajouter la valeur textuelle à chaque réponse pour permettre l'analyse textuelle
    const answersWithText = { ...answersToEnrich };
    Object.keys(answersWithText).forEach(questionId => {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        const option = question.options.find(opt => opt.id === answersWithText[questionId]?.optionId);
        if (option) {
          answersWithText[questionId] = {
            ...answersWithText[questionId],
            text: option.text
          };
        }
      }
    });
    localStorage.setItem('dadvisor_temp_answers', JSON.stringify(answersWithText));
  };
  
  /**
   * Gère la sélection d'une réponse
   * @param questionId ID de la question
   * @param optionId ID de l'option sélectionnée 
   * @param value Valeur de l'option
   */
  const handleAnswer = (questionId: string, optionId: string, value: number) => {
    // Enregistrer le score précédent
    const oldAnswers = { ...answers };
    setPreviousScore(calculateRiskScore(oldAnswers));
    
    // Trouver la question et l'option pour stocker le texte de la réponse
    const question = questions.find(q => q.id === questionId);
    const option = question?.options.find(opt => opt.id === optionId);
    
    // Mettre à jour les réponses
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: { 
          optionId, 
          value,
          text: option?.text || "" // Stocker également le texte de la réponse
        }
      };
      
      // Mettre à jour le score actuel
      setScore(calculateRiskScore(newAnswers));
      
      return newAnswers;
    });
    
    // Avancer automatiquement à la question suivante après un court délai
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Si c'était la dernière question, terminer le questionnaire
        setIsComplete(true);
      }
    }, 500);
  };
  
  /**
   * Réinitialise le questionnaire pour le refaire
   */
  const handleRetakeQuestionnaire = () => {
    // Réinitialiser complètement l'état du questionnaire
    setIsComplete(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(0);
    setPreviousScore(0);
    setShowIntroduction(true);
    setShowAnalysis(false); // S'assurer que l'analyse n'est pas affichée
    
    // Effacer localStorage
    clearStorage();
    
    console.log("Questionnaire réinitialisé complètement");
  };
  
  return {
    handleAnswer,
    enrichResponsesWithText,
    handleRetakeQuestionnaire
  };
};
