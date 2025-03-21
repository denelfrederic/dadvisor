
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
  // Vérifions si answers est défini. Si non, essayons de le récupérer du localStorage
  let questionnaireAnswers: QuestionnaireResponses | null = answers || null;
  
  if (!questionnaireAnswers) {
    try {
      const storedAnswers = localStorage.getItem('dadvisor_temp_answers');
      if (storedAnswers) {
        questionnaireAnswers = JSON.parse(storedAnswers);
        console.log("Réponses chargées du localStorage pour recommandation:", 
          Object.keys(questionnaireAnswers || {}).length);
      } else {
        console.log("Aucune réponse trouvée dans le localStorage pour recommandation");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des réponses du localStorage:", error);
    }
  }
  
  // Si toujours pas de réponses, utiliser uniquement le score
  if (!questionnaireAnswers) {
    console.log("Utilisation uniquement du score pour recommandation:", riskScore);
    return getRecommendationByScore(riskScore);
  }
  
  console.log("Analyse complète des réponses:", JSON.stringify(questionnaireAnswers, null, 2));
  
  // PRIORITÉ ABSOLUE: Vérification de la préférence pour la souveraineté économique
  if (questionnaireAnswers.sovereignty) {
    const sovereigntyAnswer = questionnaireAnswers.sovereignty;
    console.log("Réponse détaillée sur la souveraineté:", JSON.stringify(sovereigntyAnswer, null, 2));
    
    // Vérification explicite des ID d'options et valeurs numériques
    if (sovereigntyAnswer.optionId === "sovereignty-3" || 
        sovereigntyAnswer.optionId === "sovereignty-4" || 
        sovereigntyAnswer.value >= 3) {
      
      console.log("⭐ MATCH sur préférence forte pour souveraineté - Choix 3 ou 4 sélectionné");
      return "wareconomy";
    }
    
    // Vérification secondaire pour l'option 2 (préférence modérée)
    if (sovereigntyAnswer.optionId === "sovereignty-2" || sovereigntyAnswer.value === 2) {
      console.log("⭐ MATCH sur préférence modérée pour souveraineté - Choix 2 sélectionné");
      
      // Si score élevé et préférence modérée, on privilégie war economy
      if (riskScore >= 50) {
        return "wareconomy";
      }
    }
    
    // Vérification supplémentaire basée sur le texte de la réponse
    if (sovereigntyAnswer.text) {
      const lowercaseText = sovereigntyAnswer.text.toLowerCase();
      if (lowercaseText.includes("france") || 
          lowercaseText.includes("europe") || 
          lowercaseText.includes("français") || 
          lowercaseText.includes("européen") || 
          lowercaseText.includes("souveraineté")) {
        
        console.log("⭐ MATCH sur le texte pour souveraineté:", lowercaseText);
        return "wareconomy";
      }
    }
  }
  
  // Recherche de mots-clés liés à la souveraineté dans TOUTES les réponses
  for (const questionId in questionnaireAnswers) {
    if (!questionnaireAnswers[questionId]) continue;
    
    const answer = questionnaireAnswers[questionId];
    
    if (answer && answer.text) {
      const lowercaseText = answer.text.toLowerCase();
      
      // Recherche plus large de mots-clés pertinents
      if (lowercaseText.includes("france") || 
          lowercaseText.includes("europe") || 
          lowercaseText.includes("français") || 
          lowercaseText.includes("européen") || 
          lowercaseText.includes("souveraineté") ||
          lowercaseText.includes("national") ||
          lowercaseText.includes("local") ||
          lowercaseText.includes("patriot")) {
        
        console.log("⭐ MATCH sur le texte d'une autre question:", questionId, lowercaseText);
        return "wareconomy";
      }
    }
  }
  
  // Si aucune préférence de souveraineté n'est détectée, utiliser la logique basée sur le score
  console.log("Aucune préférence de souveraineté détectée, utilisation du score:", riskScore);
  return getRecommendationByScore(riskScore);
};

/**
 * Obtient une recommandation basée uniquement sur le score
 * @param riskScore Le score de risque calculé
 * @returns L'ID du portefeuille recommandé
 */
function getRecommendationByScore(riskScore: number): string {
  if (riskScore < 40) {
    return "conservative";
  } else if (riskScore < 70) {
    return "balanced";
  } else {
    return "growth";
  }
}

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
  
  if (!answers) return preferences;
  
  // Détecte l'intérêt pour la souveraineté économique
  if (answers.sovereignty) {
    if (answers.sovereignty.value >= 3 || 
        answers.sovereignty.optionId === "sovereignty-3" || 
        answers.sovereignty.optionId === "sovereignty-4") {
      preferences.sovereigntyFocus = true;
    } else if (answers.sovereignty.value >= 2 || 
               answers.sovereignty.optionId === "sovereignty-2") {
      // Préférence modérée pour la souveraineté
      preferences.sovereigntyFocus = true;
    }
    
    // Vérification supplémentaire basée sur le texte
    if (answers.sovereignty.text) {
      const lowercaseText = answers.sovereignty.text.toLowerCase();
      if (lowercaseText.includes("france") || 
          lowercaseText.includes("europe") || 
          lowercaseText.includes("français") || 
          lowercaseText.includes("européen") || 
          lowercaseText.includes("souveraineté")) {
        preferences.sovereigntyFocus = true;
      }
    }
  }
  
  // Vérification dans toutes les réponses
  for (const questionId in answers) {
    if (!answers[questionId]) continue;
    
    const answer = answers[questionId];
    if (answer && answer.text) {
      const lowercaseText = answer.text.toLowerCase();
      if (lowercaseText.includes("france") || 
          lowercaseText.includes("europe") || 
          lowercaseText.includes("français") || 
          lowercaseText.includes("européen") || 
          lowercaseText.includes("souveraineté") ||
          lowercaseText.includes("national") ||
          lowercaseText.includes("local") ||
          lowercaseText.includes("patriot")) {
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
