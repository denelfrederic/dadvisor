
import { useState, useEffect } from "react";
import { QuestionnaireResponses } from "../types";
import { calculateRiskScore, getInvestorProfileAnalysis, analyzeInvestmentStyle, questions } from "@/utils/questionnaire";

/**
 * Hook pour gérer l'état du questionnaire
 * Centralise toutes les variables d'état utilisées par le questionnaire
 */
export const useQuestionnaireState = () => {
  // Vérifier localStorage pour l'initialisation de showIntroduction
  const initialShowIntroduction = (() => {
    try {
      const hasStarted = localStorage.getItem('questionnaire_started') === 'true';
      const forceHideIntro = localStorage.getItem('show_introduction') === 'false';
      return !(hasStarted || forceHideIntro);
    } catch (error) {
      console.error("Erreur lors de la lecture de localStorage:", error);
      return true;
    }
  })();

  // États principaux
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireResponses>({});
  const [previousScore, setPreviousScore] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showIntroduction, setShowIntroduction] = useState(initialShowIntroduction);
  const [saving, setSaving] = useState(false);
  const [hasShownCompletionToast, setHasShownCompletionToast] = useState(false);
  
  // Synchroniser les changements d'état avec localStorage
  useEffect(() => {
    try {
      if (!showIntroduction) {
        localStorage.setItem('show_introduction', 'false');
        console.log("✅ État showIntroduction synchronisé avec localStorage:", false);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la synchronisation avec localStorage:", error);
    }
  }, [showIntroduction]);
  
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
