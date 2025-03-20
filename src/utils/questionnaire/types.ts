
/**
 * Interface pour une option de réponse
 */
export interface Option {
  id: string;
  text: string;
  value: number;
}

/**
 * Interface pour une question du questionnaire
 */
export interface Question {
  id: string;
  text: string;
  options: Option[];
}

/**
 * Type pour stocker les réponses
 */
export interface QuestionnaireResponses {
  [questionId: string]: {
    optionId: string;
    value: number;
  };
}

/**
 * Interface pour les caractéristiques d'un profil d'investisseur
 */
export interface InvestorProfileAnalysis {
  title: string;
  description: string;
  traits: string[];
  suitableInvestments: string[];
  risksToConsider: string[];
  timeHorizon: string;
  allocation: {
    label: string;
    value: number;
  }[];
}

/**
 * Interface pour les éléments d'insight du style d'investissement
 */
export interface InsightItem {
  text: string;
  iconName?: string;
}
