
import { TEMP_ANSWERS_KEY, TEMP_SCORE_KEY, TEMP_COMPLETE_KEY, QuestionnaireResponses } from "./types";

export const saveAnswersToStorage = (answers: QuestionnaireResponses): void => {
  if (Object.keys(answers).length > 0) {
    localStorage.setItem(TEMP_ANSWERS_KEY, JSON.stringify(answers));
  }
};

export const saveScoreToStorage = (score: number): void => {
  localStorage.setItem(TEMP_SCORE_KEY, JSON.stringify(score));
};

export const saveCompleteStatusToStorage = (isComplete: boolean): void => {
  localStorage.setItem(TEMP_COMPLETE_KEY, JSON.stringify(isComplete));
};

export const loadAnswersFromStorage = (): QuestionnaireResponses | null => {
  const savedAnswers = localStorage.getItem(TEMP_ANSWERS_KEY);
  if (savedAnswers) {
    try {
      return JSON.parse(savedAnswers) as QuestionnaireResponses;
    } catch (e) {
      console.error("Error parsing saved answers:", e);
    }
  }
  return null;
};

export const loadScoreFromStorage = (): number | null => {
  const savedScore = localStorage.getItem(TEMP_SCORE_KEY);
  if (savedScore) {
    try {
      return JSON.parse(savedScore) as number;
    } catch (e) {
      console.error("Error parsing saved score:", e);
    }
  }
  return null;
};

export const loadCompleteStatusFromStorage = (): boolean | null => {
  const savedComplete = localStorage.getItem(TEMP_COMPLETE_KEY);
  if (savedComplete) {
    try {
      return JSON.parse(savedComplete) as boolean;
    } catch (e) {
      console.error("Error parsing saved complete status:", e);
    }
  }
  return null;
};

export const clearQuestionnaireStorage = (): void => {
  localStorage.removeItem(TEMP_ANSWERS_KEY);
  localStorage.removeItem(TEMP_SCORE_KEY);
  localStorage.removeItem(TEMP_COMPLETE_KEY);
};
