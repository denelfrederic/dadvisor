
/**
 * Fonctions de recommandation de portefeuilles
 */

import { portfolios } from "./data";

/**
 * Détermine le profil d'investissement recommandé basé sur le score de risque
 * @param riskScore Le score de risque calculé
 * @returns L'ID du portefeuille recommandé
 */
export const getRecommendedPortfolio = (riskScore: number): string => {
  // Vérifie d'abord la préférence pour "Économie de Guerre" basée sur la question sovereignty
  // Cette vérification serait normalement faite à partir des réponses au questionnaire
  // Nous implémentons une version simplifiée ici
  const hasSovereigntyPreference = localStorage.getItem('dadvisor_temp_answers') ? 
    JSON.parse(localStorage.getItem('dadvisor_temp_answers') || '{}')['sovereignty']?.value >= 3 : false;
  
  if (hasSovereigntyPreference) {
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
