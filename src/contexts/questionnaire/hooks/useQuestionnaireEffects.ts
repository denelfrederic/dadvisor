
import { useEffect, useCallback } from "react";
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
 * Optimisé pour réduire les rendus et la consommation de ressources
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
  
  // Mémoisation de l'enrichissement des réponses pour éviter des calculs redondants
  const processAnswers = useCallback(() => {
    if (Object.keys(answers).length > 0) {
      saveAnswersToLocalStorage(answers);
      enrichResponsesWithText(answers);
    }
  }, [answers, saveAnswersToLocalStorage, enrichResponsesWithText]);
  
  // Mémoisation de la sauvegarde du score et de l'état
  const processScoringState = useCallback(() => {
    saveScoreAndCompletionStatus(score, isComplete);
  }, [score, isComplete, saveScoreAndCompletionStatus]);
  
  // Sauvegarder les réponses dans le localStorage - optimisé avec useCallback
  useEffect(() => {
    processAnswers();
  }, [processAnswers]);
  
  // Sauvegarder le score et l'état de complétion - optimisé avec useCallback
  useEffect(() => {
    processScoringState();
  }, [processScoringState]);
  
  // Gestion des notifications de complétion - avec vérification pour éviter les doublons
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
