
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { calculateRiskScore, getInvestorProfileAnalysis, analyzeInvestmentStyle, questions, InvestorProfileAnalysis } from "@/utils/questionnaire";
import { QuestionnaireContextType, QuestionnaireResponses } from "./types";
import { useQuestionnaireStorage } from "./hooks/useQuestionnaireStorage";
import { useQuestionnaireAnalysis } from "./hooks/useQuestionnaireAnalysis";
import { useQuestionnaireNavigation } from "./hooks/useQuestionnaireNavigation";
import { useQuestionnaireSaving } from "./hooks/useQuestionnaireSaving";
import { toast } from "@/components/ui/use-toast";

const QuestionnaireContext = createContext<QuestionnaireContextType | undefined>(undefined);

export const QuestionnaireProvider = ({ children }: { children: ReactNode }) => {
  // États principaux
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireResponses>({});
  const [previousScore, setPreviousScore] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showIntroduction, setShowIntroduction] = useState(true);
  const [saving, setSaving] = useState(false);
  
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
    setShowAnalysis
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
  
  // Valeurs dérivées
  const profileAnalysis = isComplete ? getInvestorProfileAnalysis(score, answers) : null;
  const investmentStyleInsights = isComplete ? analyzeInvestmentStyle(answers) : [];

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
      
      // Enrichir les réponses avec le texte pour l'analyse
      enrichResponsesWithText(answers);
    }
  }, [answers]);

  // Sauvegarder le score et l'état de complétion
  useEffect(() => {
    saveScoreAndCompletionStatus(score, isComplete);
  }, [score, isComplete]);

  // Calculer le score et gérer la complétion du questionnaire
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const calculatedScore = calculateRiskScore(answers);
      setScore(calculatedScore);
    }
    
    if (isComplete && Object.keys(answers).length === questions.length) {
      const calculatedScore = calculateRiskScore(answers);
      setScore(calculatedScore);
      
      // Afficher un toast de confirmation
      toast({
        title: "Questionnaire terminé !",
        description: `Votre score de risque est de ${calculatedScore}`,
      });
      
      // Ne pas automatiquement montrer l'analyse si on est sur la page questionnaire
      // L'utilisateur doit cliquer sur un bouton pour la voir
      const isQuestionnairePage = window.location.pathname.includes("questionnaire");
      if (!isQuestionnairePage) {
        setShowAnalysis(true);
      }
    }
  }, [isComplete, answers]);

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

export const useQuestionnaire = () => {
  const context = useContext(QuestionnaireContext);
  if (context === undefined) {
    throw new Error("useQuestionnaire must be used within a QuestionnaireProvider");
  }
  return context;
};
