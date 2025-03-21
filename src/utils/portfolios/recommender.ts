
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
  
  console.log("Analysant les réponses du questionnaire:", JSON.stringify(questionnaireAnswers, null, 2));
  
  // Vérification de la préférence pour la souveraineté économique
  const sovereigntyAnswer = questionnaireAnswers['sovereignty'];
  
  if (sovereigntyAnswer) {
    console.log("Réponse à la question de souveraineté:", JSON.stringify(sovereigntyAnswer, null, 2));
    
    // Détecte si l'utilisateur a exprimé une préférence pour l'Europe ou la France
    // Option 2: "Je privilégie l'Europe mais sans exclusivité"
    // Option 3: "Oui, je veux favoriser les entreprises françaises et européennes"
    // Option 4: "Je souhaite investir exclusivement dans des entreprises contribuant à la souveraineté européenne"
    if (sovereigntyAnswer.value >= 2 || 
        sovereigntyAnswer.optionId === "sovereignty-2" || 
        sovereigntyAnswer.optionId === "sovereignty-3" || 
        sovereigntyAnswer.optionId === "sovereignty-4" ||
        (sovereigntyAnswer.text && (
          sovereigntyAnswer.text.toLowerCase().includes("france") || 
          sovereigntyAnswer.text.toLowerCase().includes("europe")
        ))
    ) {
      console.log("Recommandation portfolio: Économie de Guerre basée sur préférences de souveraineté");
      return "wareconomy";
    }
  }
  
  // Recherche de mots-clés liés à la souveraineté dans toutes les réponses
  // Cette analyse complémentaire capture les préférences exprimées dans d'autres questions
  for (const questionId in questionnaireAnswers) {
    const answer = questionnaireAnswers[questionId];
    
    // Vérifier si la réponse contient un texte
    if (answer && answer.text) {
      const answerText = answer.text.toLowerCase();
      // Recherche de mots-clés liés à la souveraineté économique
      if (answerText.includes("france") || 
          answerText.includes("europe") || 
          answerText.includes("français") || 
          answerText.includes("européen") || 
          answerText.includes("souveraineté")) {
        console.log("Mot-clé de souveraineté détecté dans la réponse à la question:", questionId);
        console.log("Texte:", answerText);
        return "wareconomy";
      }
    }
  }
  
  // Sinon, utiliser la logique habituelle basée sur le score de risque
  console.log("Aucune préférence de souveraineté détectée, utilisation du score de risque:", riskScore);
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
  if (answers.sovereignty) {
    if (answers.sovereignty.value >= 2 || 
        answers.sovereignty.optionId === "sovereignty-2" || 
        answers.sovereignty.optionId === "sovereignty-3" || 
        answers.sovereignty.optionId === "sovereignty-4" ||
        (answers.sovereignty.text && (
          answers.sovereignty.text.toLowerCase().includes("france") || 
          answers.sovereignty.text.toLowerCase().includes("europe")
        ))) {
      preferences.sovereigntyFocus = true;
    }
  }
  
  // Vérification alternative basée sur les mots-clés
  for (const questionId in answers) {
    const answer = answers[questionId];
    if (answer && answer.text) {
      const answerText = answer.text.toLowerCase();
      if (answerText.includes("france") || 
          answerText.includes("europe") || 
          answerText.includes("français") || 
          answerText.includes("européen") || 
          answerText.includes("souveraineté")) {
        preferences.sovereigntyFocus = true;
      }
    }
  }
  
  // Détecte l'intérêt pour les cryptomonnaies
  if (answers.crypto && answers.crypto.value >= 3) {
    preferences.cryptoInterest = true;
  }
  
  return preferences;
};
