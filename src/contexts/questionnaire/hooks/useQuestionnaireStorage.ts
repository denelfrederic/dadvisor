
import { QuestionnaireResponses } from "../types";
import {
  saveAnswersToStorage,
  saveScoreToStorage,
  saveCompleteStatusToStorage,
  loadAnswersFromStorage,
  loadScoreFromStorage,
  loadCompleteStatusFromStorage,
  clearQuestionnaireStorage
} from "../storage";

/**
 * Hook personnalisé pour gérer le stockage des données du questionnaire
 */
export const useQuestionnaireStorage = () => {
  /**
   * Charge les données stockées localement
   */
  const loadStoredData = () => {
    const savedAnswers = loadAnswersFromStorage();
    const savedScore = loadScoreFromStorage();
    const savedComplete = loadCompleteStatusFromStorage();
    
    return {
      savedAnswers,
      savedScore,
      savedComplete
    };
  };
  
  /**
   * Enregistre les réponses dans le stockage local
   * @param answers Réponses au questionnaire
   */
  const saveAnswersToLocalStorage = (answers: QuestionnaireResponses) => {
    saveAnswersToStorage(answers);
  };
  
  /**
   * Enregistre le score et l'état de complétion
   * @param score Score calculé
   * @param isComplete État de complétion
   */
  const saveScoreAndCompletionStatus = (score: number, isComplete: boolean) => {
    saveScoreToStorage(score);
    saveCompleteStatusToStorage(isComplete);
  };
  
  /**
   * Efface toutes les données du questionnaire du stockage local
   */
  const clearStorage = () => {
    clearQuestionnaireStorage();
  };
  
  return {
    loadStoredData,
    saveAnswersToLocalStorage,
    saveScoreAndCompletionStatus,
    clearStorage
  };
};
