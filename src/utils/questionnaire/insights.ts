
import { QuestionnaireResponses } from "./types";

/**
 * Analyse les réponses du questionnaire pour identifier des insights sur le style d'investissement
 * @param answers Les réponses du questionnaire
 * @returns Un tableau d'insights sur le style d'investissement
 */
export const analyzeInvestmentStyle = (answers: QuestionnaireResponses): string[] => {
  const insights: string[] = [];

  // Ajoute des insights basés sur les réponses spécifiques
  if (answers.risk?.value >= 3) {
    insights.push("Vous êtes à l'aise avec la volatilité du marché et la recherche d'opportunités.");
  } else if (answers.risk?.value <= 2) {
    insights.push("Vous privilégiez la sécurité et la préservation du capital.");
  }

  if (answers.horizon?.value >= 3) {
    insights.push("Votre horizon d'investissement à long terme favorise la croissance du capital.");
  } else {
    insights.push("Votre horizon d'investissement court à moyen terme suggère une approche plus prudente.");
  }

  if (answers.crypto?.value >= 3) {
    insights.push("Vous êtes ouvert aux actifs numériques et aux nouvelles technologies financières.");
  }

  if (answers.emergency?.value <= 2) {
    insights.push("La constitution d'un fonds d'urgence devrait être une priorité avant d'investir davantage.");
  }
  
  // Nouvel insight pour la préférence de souveraineté
  if (answers.sovereignty?.value >= 3) {
    insights.push("Le soutien à la souveraineté économique française et européenne est une priorité dans vos investissements.");
  }

  return insights;
};
