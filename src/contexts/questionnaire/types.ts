
import { InvestorProfileAnalysis, InsightItem } from "@/utils/questionnaire";

/**
 * Interface pour les réponses au questionnaire
 */
export interface QuestionnaireResponses {
  [questionId: string]: {
    optionId: string;
    value: number;
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
  showIntroduction: boolean;
  setShowIntroduction: (show: boolean) => void;
  saving: boolean;
  profileAnalysis: InvestorProfileAnalysis | null;
  investmentStyleInsights: InsightItem[];
  handleAnswer: (questionId: string, optionId: string, value: number) => void;
  handleRetakeQuestionnaire: () => void;
  saveInvestmentProfile: () => Promise<void>;
  handleContinueToPortfolios: () => void;
}
