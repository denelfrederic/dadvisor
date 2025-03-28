
import { ReactNode, useEffect } from "react";
import { QuestionnaireContext } from "./context";
import { useQuestionnaireState } from "./hooks/useQuestionnaireState";
import { useQuestionnaireStorage } from "./hooks/useQuestionnaireStorage";
import { useQuestionnaireAnalysis } from "./hooks/useQuestionnaireAnalysis";
import { useQuestionnaireNavigation } from "./hooks/useQuestionnaireNavigation";
import { useQuestionnaireSaving } from "./hooks/useQuestionnaireSaving";
import { useQuestionnaireEffects } from "./hooks/useQuestionnaireEffects";
import { useQuestionnaireInitializer } from "./hooks/useQuestionnaireInitializer";
import { toast } from "sonner";

/**
 * Fournisseur du contexte du questionnaire
 * @param children Composants enfants
 */
export const QuestionnaireProvider = ({ children }: { children: ReactNode }) => {
  // Utiliser le hook d'état pour gérer tous les états du questionnaire
  const {
    currentQuestionIndex, setCurrentQuestionIndex,
    answers, setAnswers,
    previousScore, setPreviousScore,
    score, setScore,
    isComplete, setIsComplete,
    showAnalysis, setShowAnalysis,
    showIntroduction, setShowIntroduction,
    saving, setSaving,
    hasShownCompletionToast, setHasShownCompletionToast,
    profileAnalysis, investmentStyleInsights
  } = useQuestionnaireState();
  
  // Hooks personnalisés pour les différentes fonctionnalités
  const { 
    loadStoredData, 
    saveAnswersToLocalStorage, 
    saveScoreAndCompletionStatus,
    clearStorage 
  } = useQuestionnaireStorage();
  
  const {
    handleAnswer,
    enrichResponsesWithText,
    handleRetakeQuestionnaire
  } = useQuestionnaireAnalysis({
    answers,
    setAnswers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    setPreviousScore,
    setScore,
    setIsComplete,
    setShowIntroduction,
    setShowAnalysis,
    clearStorage
  });
  
  const {
    handleContinueToPortfolios
  } = useQuestionnaireNavigation({
    score,
    answers
  });
  
  const {
    saveInvestmentProfile
  } = useQuestionnaireSaving({
    setSaving
  });

  // Initialisation et gestion des effets secondaires
  useQuestionnaireInitializer({
    setAnswers,
    setScore,
    setIsComplete,
    setShowAnalysis,
    setShowIntroduction,
    loadStoredData,
    clearStorage
  });

  // Gestion des effets secondaires
  useQuestionnaireEffects({
    answers,
    score,
    isComplete,
    hasShownCompletionToast,
    setHasShownCompletionToast,
    saveAnswersToLocalStorage,
    saveScoreAndCompletionStatus,
    enrichResponsesWithText
  });

  // Synchronisation avec localStorage pour garantir la cohérence d'état
  useEffect(() => {
    // Vérification et synchronisation avec localStorage
    const started = localStorage.getItem('questionnaire_started') === 'true';
    const hideIntro = localStorage.getItem('show_introduction') === 'false';
    
    if ((started || hideIntro) && showIntroduction) {
      console.log("🔄 QuestionnaireProvider: Synchronisation de l'état avec localStorage");
      setShowIntroduction(false);
    }
  }, [showIntroduction, setShowIntroduction]);

  // Fonction pour envelopper saveInvestmentProfile avec les arguments corrects
  const wrappedSaveInvestmentProfile = () => {
    if (profileAnalysis && investmentStyleInsights.length > 0) {
      return saveInvestmentProfile(
        profileAnalysis,
        investmentStyleInsights,
        answers,
        score
      );
    }
    return Promise.resolve();
  };

  // Log pour débogage
  console.log("📋 QuestionnaireProvider actif - État showIntroduction:", showIntroduction, 
              "typeof setShowIntroduction:", typeof setShowIntroduction);

  return (
    <QuestionnaireContext.Provider value={{
      currentQuestionIndex,
      setCurrentQuestionIndex,
      answers,
      previousScore,
      setPreviousScore,
      score,
      isComplete,
      setIsComplete,
      showAnalysis,
      setShowAnalysis,
      showIntroduction,
      setShowIntroduction,
      saving,
      profileAnalysis,
      investmentStyleInsights,
      handleAnswer,
      handleRetakeQuestionnaire,
      saveInvestmentProfile: wrappedSaveInvestmentProfile,
      handleContinueToPortfolios
    }}>
      {children}
    </QuestionnaireContext.Provider>
  );
};
