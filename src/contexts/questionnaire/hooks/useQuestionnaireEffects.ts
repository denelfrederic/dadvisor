
import { useEffect } from "react";
import { QuestionnaireResponses } from "../types";
import { toast } from "sonner";

/**
 * Props pour le hook useQuestionnaireEffects
 */
interface UseQuestionnaireEffectsProps {
  answers: QuestionnaireResponses;
  score: number;
  isComplete: boolean;
  hasShownCompletionToast: boolean;
  setHasShownCompletionToast: (shown: boolean) => void;
  saveAnswersToLocalStorage: (answers: QuestionnaireResponses) => void;
  saveScoreAndCompletionStatus: (score: number, isComplete: boolean) => void;
  enrichResponsesWithText: (answers: QuestionnaireResponses) => void;
}

/**
 * Hook personnalisé pour gérer les effets secondaires du questionnaire
 * Centralise tous les useEffect liés au questionnaire
 */
export const useQuestionnaireEffects = ({
  answers,
  score,
  isComplete,
  hasShownCompletionToast,
  setHasShownCompletionToast,
  saveAnswersToLocalStorage,
  saveScoreAndCompletionStatus,
  enrichResponsesWithText
}: UseQuestionnaireEffectsProps) => {
  
  // Sauvegarder les réponses dans le localStorage
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      saveAnswersToLocalStorage(answers);
      enrichResponsesWithText(answers);
    }
  }, [answers, saveAnswersToLocalStorage, enrichResponsesWithText]);
  
  // Sauvegarder le score et l'état de complétion
  useEffect(() => {
    saveScoreAndCompletionStatus(score, isComplete);
  }, [score, isComplete, saveScoreAndCompletionStatus]);
  
  // Gestion des notifications de complétion
  useEffect(() => {
    if (isComplete && Object.keys(answers).length > 0 && !hasShownCompletionToast) {
      toast("Questionnaire terminé ! Votre score de risque est de " + score);
      setHasShownCompletionToast(true);
    }
  }, [isComplete, answers, hasShownCompletionToast, score, setHasShownCompletionToast]);
  
  // Réinitialiser le toast lors de la reprise du questionnaire
  useEffect(() => {
    if (!isComplete) {
      setHasShownCompletionToast(false);
    }
  }, [isComplete, setHasShownCompletionToast]);
};
