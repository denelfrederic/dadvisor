
import { QuestionnaireResponses, TEMP_ANSWERS_KEY, TEMP_SCORE_KEY, TEMP_COMPLETE_KEY } from "./types";

// Fonctions vides pour prévenir les erreurs sans utiliser localStorage
export const saveAnswersToStorage = (answers: QuestionnaireResponses): void => {
  // Ne fait rien
};

export const saveScoreToStorage = (score: number): void => {
  // Ne fait rien
};

export const saveCompleteStatusToStorage = (isComplete: boolean): void => {
  // Ne fait rien
};

export const loadAnswersFromStorage = (): QuestionnaireResponses | null => {
  return null;
};

export const loadScoreFromStorage = (): number | null => {
  return null;
};

export const loadCompleteStatusFromStorage = (): boolean | null => {
  return null;
};

export const clearQuestionnaireStorage = (): void => {
  // Ne fait rien
};
