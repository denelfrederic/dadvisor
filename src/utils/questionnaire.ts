
/**
 * Données et utilitaires pour le questionnaire de profilage financier
 */

import { Question } from "@/components/QuestionCard";

// Questions du questionnaire de profilage
export const questions: Question[] = [
  {
    id: "horizon",
    text: "Quel est votre horizon d'investissement ?",
    options: [
      {
        id: "horizon-1",
        text: "Moins de 2 ans",
        value: 1
      },
      {
        id: "horizon-2",
        text: "2 à 5 ans",
        value: 2
      },
      {
        id: "horizon-3",
        text: "5 à 10 ans",
        value: 3
      },
      {
        id: "horizon-4",
        text: "Plus de 10 ans",
        value: 4
      }
    ]
  },
  {
    id: "risk",
    text: "Comment réagiriez-vous si vos investissements perdaient 20% de leur valeur en un mois ?",
    options: [
      {
        id: "risk-1",
        text: "Je vendrais tout immédiatement pour éviter d'autres pertes",
        value: 1
      },
      {
        id: "risk-2",
        text: "Je vendrais une partie de mes investissements",
        value: 2
      },
      {
        id: "risk-3",
        text: "Je ne ferais rien et attendrais que le marché se redresse",
        value: 3
      },
      {
        id: "risk-4",
        text: "J'achèterais davantage pour profiter des prix bas",
        value: 4
      }
    ]
  },
  {
    id: "income",
    text: "Quelle part de vos revenus mensuels pouvez-vous consacrer à l'investissement ?",
    options: [
      {
        id: "income-1",
        text: "Moins de 5%",
        value: 1
      },
      {
        id: "income-2",
        text: "Entre 5% et 15%",
        value: 2
      },
      {
        id: "income-3",
        text: "Entre 15% et 30%",
        value: 3
      },
      {
        id: "income-4",
        text: "Plus de 30%",
        value: 4
      }
    ]
  },
  {
    id: "knowledge",
    text: "Comment évalueriez-vous vos connaissances en matière d'investissement ?",
    options: [
      {
        id: "knowledge-1",
        text: "Novice - Je connais très peu les marchés financiers",
        value: 1
      },
      {
        id: "knowledge-2",
        text: "Débutant - Je comprends les bases",
        value: 2
      },
      {
        id: "knowledge-3",
        text: "Intermédiaire - J'ai déjà investi et je comprends les risques",
        value: 3
      },
      {
        id: "knowledge-4",
        text: "Expert - Je suis très familier avec les différents types d'investissements",
        value: 4
      }
    ]
  },
  {
    id: "goal",
    text: "Quel est votre principal objectif d'investissement ?",
    options: [
      {
        id: "goal-1",
        text: "Préserver mon capital avec un risque minimal",
        value: 1
      },
      {
        id: "goal-2",
        text: "Générer un revenu régulier",
        value: 2
      },
      {
        id: "goal-3",
        text: "Croissance équilibrée entre revenu et appréciation du capital",
        value: 3
      },
      {
        id: "goal-4",
        text: "Croissance maximale du capital, prêt à accepter des fluctuations importantes",
        value: 4
      }
    ]
  }
];

// Type pour stocker les réponses
export interface QuestionnaireResponses {
  [questionId: string]: {
    optionId: string;
    value: number;
  };
}

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
