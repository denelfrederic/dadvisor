
import { QuestionnaireResponses } from "./types";
import { questions } from "./questions";

/**
 * Calcule le score de profil de risque basé sur les réponses au questionnaire
 * @param responses Les réponses au questionnaire
 * @returns Le score total calculé
 */
export const calculateRiskScore = (responses: QuestionnaireResponses): number => {
  let totalScore = 0;
  let answeredQuestions = 0;
  
  Object.values(responses).forEach(response => {
    totalScore += response.value;
    answeredQuestions++;
  });
  
  return Math.round((totalScore / (answeredQuestions * 4)) * 100);
};

/**
 * Détermine le profil d'investissement recommandé basé sur le score de risque
 * @param riskScore Le score de risque calculé
 * @returns L'ID du portefeuille recommandé
 */
export const getRecommendedPortfolio = (riskScore: number): string => {
  if (riskScore < 40) {
    return "conservative";
  } else if (riskScore < 70) {
    return "balanced";
  } else {
    return "growth";
  }
};

/**
 * Vérifie si l'utilisateur a répondu à toutes les questions
 * @param responses Les réponses au questionnaire
 * @returns Vrai si toutes les questions ont été répondues
 */
export const hasCompletedQuestionnaire = (responses: QuestionnaireResponses): boolean => {
  return questions.every(question => responses[question.id] !== undefined);
};

/**
 * Vérifie si le questionnaire a passé le seuil de validation (50%)
 * @param riskScore Le score de risque calculé
 * @returns Vrai si le score dépasse le seuil de validation
 */
export const hasPassedValidationThreshold = (riskScore: number): boolean => {
  return riskScore >= 50;
};
