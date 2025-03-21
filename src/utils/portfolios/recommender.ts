
/**
 * Fonctions de recommandation de portefeuilles
 */

import { portfolios } from "./data";
import { QuestionnaireResponses } from "@/utils/questionnaire/types";

/**
 * Détermine le profil d'investissement recommandé basé sur le score de risque
 * et les réponses spécifiques au questionnaire
 * @param riskScore Le score de risque calculé
 * @param answers Les réponses au questionnaire (optionnel)
 * @returns L'ID du portefeuille recommandé
 */
export const getRecommendedPortfolio = (riskScore: number, answers?: QuestionnaireResponses): string => {
  // Vérifie d'abord la préférence pour "Économie de Guerre" basée sur la question sovereignty
  // Récupère soit les réponses passées en paramètre, soit celles stockées dans le localStorage
  const storedAnswers = localStorage.getItem('dadvisor_temp_answers') ? 
    JSON.parse(localStorage.getItem('dadvisor_temp_answers') || '{}') : {};
  
  const questionnaireAnswers = answers || storedAnswers;
  
  // Vérification de la préférence pour la souveraineté économique
  const sovereigntyAnswer = questionnaireAnswers['sovereignty'];
  
  // Détecte spécifiquement si l'utilisateur a choisi les options 3 ou 4 pour la souveraineté
  // Option 3: "Oui, je veux favoriser les entreprises françaises et européennes"
  // Option 4: "Je souhaite investir exclusivement dans des entreprises contribuant à la souveraineté européenne"
  if (sovereigntyAnswer && (
      sovereigntyAnswer.value >= 3 || 
      sovereigntyAnswer.optionId === "sovereignty-3" || 
      sovereigntyAnswer.optionId === "sovereignty-4"
    )) {
    console.log("Recommandation portfolio: Économie de Guerre basée sur préférences de souveraineté");
    return "wareconomy";
  }
  
  // Sinon, utiliser la logique habituelle basée sur le score de risque
  if (riskScore < 40) {
    return "conservative";
  } else if (riskScore < 70) {
    return "balanced";
  } else {
    return "growth";
  }
};

/**
 * Analyse les réponses du questionnaire pour extraire les préférences thématiques
 * @param answers Les réponses au questionnaire
 * @returns Un objet contenant les préférences détectées
 */
export const analyzeInvestmentPreferences = (answers: QuestionnaireResponses): Record<string, boolean> => {
  const preferences: Record<string, boolean> = {
    sovereigntyFocus: false,
    cryptoInterest: false
  };
  
  // Détecte l'intérêt pour la souveraineté économique
  if (answers.sovereignty && answers.sovereignty.value >= 3) {
    preferences.sovereigntyFocus = true;
  }
  
  // Détecte l'intérêt pour les cryptomonnaies
  if (answers.crypto && answers.crypto.value >= 3) {
    preferences.cryptoInterest = true;
  }
  
  return preferences;
};
