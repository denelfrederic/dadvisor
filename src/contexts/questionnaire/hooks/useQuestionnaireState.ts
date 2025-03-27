
import { useState } from "react";
import { QuestionnaireResponses } from "../types";
import { calculateRiskScore, getInvestorProfileAnalysis, analyzeInvestmentStyle, questions } from "@/utils/questionnaire";

/**
 * Hook pour gérer l'état du questionnaire
 * Centralise toutes les variables d'état utilisées par le questionnaire
 */
export const useQuestionnaireState = () => {
  // États principaux
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireResponses>({});
  const [previousScore, setPreviousScore] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showIntroduction, setShowIntroduction] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasShownCompletionToast, setHasShownCompletionToast] = useState(false);
  
  // Valeurs dérivées
  const profileAnalysis = isComplete ? getInvestorProfileAnalysis(score, answers) : null;
  const investmentStyleInsights = isComplete ? analyzeInvestmentStyle(answers) : [];

  return {
    // États
    currentQuestionIndex, setCurrentQuestionIndex,
    answers, setAnswers,
    previousScore, setPreviousScore,
    score, setScore,
    isComplete, setIsComplete,
    showAnalysis, setShowAnalysis,
    showIntroduction, setShowIntroduction,
    saving, setSaving,
    hasShownCompletionToast, setHasShownCompletionToast,
    
    // Valeurs dérivées
    profileAnalysis,
    investmentStyleInsights
  };
};
