
import { InvestorProfileAnalysis } from "@/utils/questionnaire";
import { Json } from "@/integrations/supabase/types";

export type QuestionnaireResponses = Record<string, { optionId: string, value: number }>;

export interface QuestionnaireContextType {
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  answers: QuestionnaireResponses;
  previousScore: number;
  setPreviousScore: (score: number) => void;
  score: number;
  isComplete: boolean;
  setIsComplete: (complete: boolean) => void;
  showAnalysis: boolean;
  saving: boolean;
  profileAnalysis: InvestorProfileAnalysis | null;
  investmentStyleInsights: string[];
  handleAnswer: (questionId: string, optionId: string, value: number) => void;
  handleRetakeQuestionnaire: () => void;
  saveInvestmentProfile: () => Promise<void>;
  handleContinueToPortfolios: () => void;
}

// Keys for localStorage
export const TEMP_ANSWERS_KEY = "dadvisor_temp_answers";
export const TEMP_SCORE_KEY = "dadvisor_temp_score";
export const TEMP_COMPLETE_KEY = "dadvisor_temp_complete";

export interface ProfileDataForDb {
  analysis: InvestorProfileAnalysis;
  investmentStyleInsights: string[];
  answers: QuestionnaireResponses;
}
