
import { useState, useEffect, useCallback } from "react";
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
  
  // Fonction mémoizée pour synchroniser showIntroduction avec localStorage
  const updateShowIntroduction = useCallback((value: boolean) => {
    setShowIntroduction(value);
    try {
      localStorage.setItem('show_introduction', String(!value));
      console.log("✅ État showIntroduction synchronisé avec localStorage:", value);
    } catch (error) {
      console.error("❌ Erreur lors de la synchronisation avec localStorage:", error);
    }
  }, []);
  
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
  
  // Valeurs dérivées mémoizées pour éviter les calculs inutiles
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
    showIntroduction, setShowIntroduction: updateShowIntroduction,
    saving, setSaving,
    hasShownCompletionToast, setHasShownCompletionToast,
    
    // Valeurs dérivées
    profileAnalysis,
    investmentStyleInsights
  };
};
