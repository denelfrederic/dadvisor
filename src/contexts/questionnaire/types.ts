
import { InvestorProfileAnalysis } from "@/utils/questionnaire";

/**
 * Interface pour les réponses au questionnaire
 */
export interface QuestionnaireResponses {
  [questionId: string]: {
    optionId: string;
    value: number;
    text?: string; // Ajout de la propriété text optionnelle
  };
}

/**
 * Interface pour le contexte du questionnaire
 */
export interface QuestionnaireContextType {
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  answers: QuestionnaireResponses;
  previousScore: number;
  setPreviousScore: (score: number) => void;
  score: number;
  isComplete: boolean;
  setIsComplete: (isComplete: boolean) => void;
  showAnalysis: boolean;
  setShowAnalysis: (show: boolean) => void; // Ajout de cette propriété
  showIntroduction: boolean;
  setShowIntroduction: (show: boolean) => void;
  saving: boolean;
  profileAnalysis: InvestorProfileAnalysis | null;
  investmentStyleInsights: string[];
  handleAnswer: (questionId: string, optionId: string, value: number) => void;
  handleRetakeQuestionnaire: () => void;
  saveInvestmentProfile: () => Promise<void>;
  handleContinueToPortfolios: () => void;
}

/**
 * Constantes pour les clés de stockage local
 */
export const TEMP_ANSWERS_KEY = "dadvisor_temp_answers";
export const TEMP_SCORE_KEY = "dadvisor_temp_score";
export const TEMP_COMPLETE_KEY = "dadvisor_temp_complete";

/**
 * Interface pour les données de profil à enregistrer en base de données
 */
export interface ProfileDataForDb {
  analysis: any;
  investmentStyleInsights: string[];
  answers: QuestionnaireResponses;
}

/**
 * Type pour représenter un élément d'analyse du style d'investissement
 */
export interface InsightItem {
  text: string;
  iconName?: string;
}
