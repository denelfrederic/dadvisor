
import { ReactNode } from "react";
import { QuestionnaireContext } from "./context";
import { useQuestionnaireState } from "./hooks/useQuestionnaireState";
import { useQuestionnaireStorage } from "./hooks/useQuestionnaireStorage";
import { useQuestionnaireAnalysis } from "./hooks/useQuestionnaireAnalysis";
import { useQuestionnaireNavigation } from "./hooks/useQuestionnaireNavigation";
import { useQuestionnaireSaving } from "./hooks/useQuestionnaireSaving";
import { useQuestionnaireEffects } from "./hooks/useQuestionnaireEffects";
import { useQuestionnaireInitializer } from "./hooks/useQuestionnaireInitializer";

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

  // Initialisation des données
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

/**
 * Hook pour utiliser le contexte du questionnaire
 * @returns Le contexte du questionnaire
 */
export const useQuestionnaire = () => {
  const context = import("react").useContext(QuestionnaireContext);
  if (context === undefined) {
    throw new Error("useQuestionnaire must be used within a QuestionnaireProvider");
  }
  return context;
};
