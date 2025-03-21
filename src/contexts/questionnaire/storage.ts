
import { QuestionnaireResponses, TEMP_ANSWERS_KEY, TEMP_SCORE_KEY, TEMP_COMPLETE_KEY } from "./types";

/**
 * Sauvegarde les réponses du questionnaire dans le stockage local
 * @param answers Les réponses à sauvegarder
 */
export const saveAnswersToStorage = (answers: QuestionnaireResponses): void => {
  try {
    localStorage.setItem(TEMP_ANSWERS_KEY, JSON.stringify(answers));
    console.log("Réponses sauvegardées dans le localStorage:", answers);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des réponses:", error);
  }
};

/**
 * Sauvegarde le score dans le stockage local
 * @param score Le score à sauvegarder
 */
export const saveScoreToStorage = (score: number): void => {
  try {
    localStorage.setItem(TEMP_SCORE_KEY, score.toString());
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du score:", error);
  }
};

/**
 * Sauvegarde l'état de complétion dans le stockage local
 * @param isComplete L'état de complétion à sauvegarder
 */
export const saveCompleteStatusToStorage = (isComplete: boolean): void => {
  try {
    localStorage.setItem(TEMP_COMPLETE_KEY, isComplete.toString());
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'état de complétion:", error);
  }
};

/**
 * Charge les réponses depuis le stockage local
 * @returns Les réponses chargées ou null si non trouvées
 */
export const loadAnswersFromStorage = (): QuestionnaireResponses | null => {
  try {
    const savedAnswers = localStorage.getItem(TEMP_ANSWERS_KEY);
    if (savedAnswers) {
      return JSON.parse(savedAnswers);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des réponses:", error);
  }
  return null;
};

/**
 * Charge le score depuis le stockage local
 * @returns Le score chargé ou null si non trouvé
 */
export const loadScoreFromStorage = (): number | null => {
  try {
    const savedScore = localStorage.getItem(TEMP_SCORE_KEY);
    if (savedScore) {
      return Number(savedScore);
    }
  } catch (error) {
    console.error("Erreur lors du chargement du score:", error);
  }
  return null;
};

/**
 * Charge l'état de complétion depuis le stockage local
 * @returns L'état de complétion chargé ou null si non trouvé
 */
export const loadCompleteStatusFromStorage = (): boolean | null => {
  try {
    const savedComplete = localStorage.getItem(TEMP_COMPLETE_KEY);
    if (savedComplete) {
      return savedComplete === 'true';
    }
  } catch (error) {
    console.error("Erreur lors du chargement de l'état de complétion:", error);
  }
  return null;
};

/**
 * Efface toutes les données du questionnaire du stockage local
 */
export const clearQuestionnaireStorage = (): void => {
  try {
    localStorage.removeItem(TEMP_ANSWERS_KEY);
    localStorage.removeItem(TEMP_SCORE_KEY);
    localStorage.removeItem(TEMP_COMPLETE_KEY);
    console.log("Données du questionnaire effacées du localStorage");
  } catch (error) {
    console.error("Erreur lors de l'effacement des données du questionnaire:", error);
  }
};
