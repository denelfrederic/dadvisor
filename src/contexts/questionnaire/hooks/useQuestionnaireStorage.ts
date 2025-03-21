
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
    try {
      const savedAnswers = loadAnswersFromStorage();
      const savedScore = loadScoreFromStorage();
      const savedComplete = loadCompleteStatusFromStorage();
      
      console.log("Données chargées du localStorage:", { 
        answersCount: savedAnswers ? Object.keys(savedAnswers).length : 0, 
        scoreExists: savedScore !== null,
        completeExists: savedComplete !== null,
        score: savedScore,
        complete: savedComplete
      });
      
      return {
        savedAnswers,
        savedScore,
        savedComplete
      };
    } catch (error) {
      console.error("Erreur lors du chargement des données stockées:", error);
      return {
        savedAnswers: null,
        savedScore: null,
        savedComplete: null
      };
    }
  };
  
  /**
   * Enregistre les réponses dans le stockage local
   * @param answers Réponses au questionnaire
   */
  const saveAnswersToLocalStorage = (answers: QuestionnaireResponses) => {
    try {
      if (!answers || Object.keys(answers).length === 0) {
        console.warn("Tentative de sauvegarde de réponses vides");
        return;
      }
      saveAnswersToStorage(answers);
      console.log("Réponses sauvegardées dans le localStorage:", Object.keys(answers).length);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des réponses:", error);
    }
  };
  
  /**
   * Enregistre le score et l'état de complétion
   * @param score Score calculé
   * @param isComplete État de complétion
   */
  const saveScoreAndCompletionStatus = (score: number, isComplete: boolean) => {
    try {
      saveScoreToStorage(score);
      saveCompleteStatusToStorage(isComplete);
      console.log("Score et complétion sauvegardés:", { score, isComplete });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du score et de la complétion:", error);
    }
  };
  
  /**
   * Efface toutes les données du questionnaire du stockage local
   */
  const clearStorage = () => {
    try {
      clearQuestionnaireStorage();
      console.log("Données du questionnaire effacées avec succès");
    } catch (error) {
      console.error("Erreur lors de l'effacement des données:", error);
    }
  };
  
  return {
    loadStoredData,
    saveAnswersToLocalStorage,
    saveScoreAndCompletionStatus,
    clearStorage
  };
};
