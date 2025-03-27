
import { useContext, useState, ReactNode, useEffect } from "react";
import { QuestionnaireContextType, QuestionnaireResponses } from "./types";
import { QuestionnaireContext } from "./context";
import { useQuestionnaireStorage } from "./hooks/useQuestionnaireStorage";
import { useQuestionnaireAnalysis } from "./hooks/useQuestionnaireAnalysis";
import { useQuestionnaireNavigation } from "./hooks/useQuestionnaireNavigation";
import { useQuestionnaireSaving } from "./hooks/useQuestionnaireSaving";
import { useQuestionnaireState } from "./hooks/useQuestionnaireState";
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
  
  // Hooks personnalisés
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

  // Charger les données lors du montage initial
  useEffect(() => {
    try {
      // Vérifier si on est sur la page du questionnaire (pathname contient "questionnaire")
      const isQuestionnairePage = window.location.pathname.includes("questionnaire");
      console.log("Chargement des données - Page questionnaire:", isQuestionnairePage);
      
      const { savedAnswers, savedScore, savedComplete } = loadStoredData();
      
      if (savedAnswers && Object.keys(savedAnswers).length > 0) {
        console.log("Chargement des réponses sauvegardées:", Object.keys(savedAnswers).length, "réponses");
        setAnswers(savedAnswers);
        
        // Détermine si on doit montrer l'introduction (seulement si aucune réponse)
        if (Object.keys(savedAnswers).length > 0) {
          setShowIntroduction(false);
        }
      }
      
      if (savedScore !== null) {
        console.log("Chargement du score sauvegardé:", savedScore);
        setScore(savedScore);
      }
      
      if (savedComplete !== null) {
        console.log("Chargement de l'état de complétion:", savedComplete);
        setIsComplete(savedComplete);
        
        // Si c'est la page du questionnaire, afficher l'introduction plutôt que l'analyse
        if (savedComplete && !isQuestionnairePage) {
          setShowAnalysis(true);
          setShowIntroduction(false);
        } else if (isQuestionnairePage) {
          // Sur la page questionnaire, on priorise l'affichage du questionnaire
          setShowAnalysis(false);
          setShowIntroduction(Object.keys(savedAnswers || {}).length === 0);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      // En cas d'erreur, réinitialiser pour éviter un état incohérent
      clearStorage();
    }
  }, []);

  // Sauvegarder les réponses dans le localStorage
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      saveAnswersToLocalStorage(answers);
      enrichResponsesWithText(answers);
    }
  }, [answers]);

  // Sauvegarder le score et l'état de complétion
  useEffect(() => {
    saveScoreAndCompletionStatus(score, isComplete);
  }, [score, isComplete]);

  // Gestion des notifications de complétion
  useEffect(() => {
    if (isComplete && Object.keys(answers).length > 0 && !hasShownCompletionToast) {
      toast("Questionnaire terminé ! Votre score de risque est de " + score);
      
      setHasShownCompletionToast(true);
    }
  }, [isComplete, answers, hasShownCompletionToast, score]);

  // Réinitialiser le toast lors de la reprise du questionnaire
  useEffect(() => {
    if (!isComplete) {
      setHasShownCompletionToast(false);
    }
  }, [isComplete]);

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
