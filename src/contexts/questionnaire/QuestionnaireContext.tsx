
import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { calculateRiskScore, getInvestorProfileAnalysis, analyzeInvestmentStyle, questions, InvestorProfileAnalysis } from "@/utils/questionnaire";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { QuestionnaireContextType, QuestionnaireResponses } from "./types";
import { 
  saveAnswersToStorage, 
  saveScoreToStorage, 
  saveCompleteStatusToStorage, 
  loadAnswersFromStorage, 
  loadScoreFromStorage, 
  loadCompleteStatusFromStorage,
  clearQuestionnaireStorage
} from "./storage";
import { saveInvestmentProfileToSupabase } from "./saveProfile";

const QuestionnaireContext = createContext<QuestionnaireContextType | undefined>(undefined);

export const QuestionnaireProvider = ({ children }: { children: ReactNode }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireResponses>({});
  const [previousScore, setPreviousScore] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showIntroduction, setShowIntroduction] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStatus();
  
  // Compute derived state
  const profileAnalysis = isComplete ? getInvestorProfileAnalysis(score, answers) : null;
  const investmentStyleInsights = isComplete ? analyzeInvestmentStyle(answers) : [];

  // Restore data from localStorage on load
  useEffect(() => {
    const savedAnswers = loadAnswersFromStorage();
    const savedScore = loadScoreFromStorage();
    const savedComplete = loadCompleteStatusFromStorage();
    
    if (savedAnswers) {
      setAnswers(savedAnswers);
      // Si l'utilisateur a déjà commencé le questionnaire, ne pas afficher l'introduction
      setShowIntroduction(Object.keys(savedAnswers).length === 0);
    }
    
    if (savedScore !== null) {
      setScore(savedScore);
    }
    
    if (savedComplete !== null) {
      setIsComplete(savedComplete);
      if (savedComplete) {
        setShowAnalysis(true);
        setShowIntroduction(false);
      }
    }
  }, []);

  // Save to localStorage when answers change
  useEffect(() => {
    saveAnswersToStorage(answers);
  }, [answers]);

  // Save score and completed status to localStorage
  useEffect(() => {
    saveScoreToStorage(score);
    saveCompleteStatusToStorage(isComplete);
  }, [score, isComplete]);

  // Calculate score when answers change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const calculatedScore = calculateRiskScore(answers);
      setScore(calculatedScore);
    }
    
    if (isComplete && Object.keys(answers).length === questions.length) {
      const calculatedScore = calculateRiskScore(answers);
      setScore(calculatedScore);
      
      toast({
        title: "Questionnaire terminé !",
        description: `Votre score de risque est de ${calculatedScore}`,
      });
      
      setShowAnalysis(true);
    }
  }, [isComplete, answers]);

  const handleAnswer = useCallback((questionId: string, optionId: string, value: number) => {
    // Save previous score
    const oldAnswers = { ...answers };
    setPreviousScore(calculateRiskScore(oldAnswers));
    
    // Update answers
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: { optionId, value }
      };
      
      // Update current score
      setScore(calculateRiskScore(newAnswers));
      
      return newAnswers;
    });
    
    // Automatically advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // If it was the last question, complete the questionnaire
        setIsComplete(true);
      }
    }, 500);
  }, [currentQuestionIndex, answers]);

  const handleRetakeQuestionnaire = useCallback(() => {
    setShowAnalysis(false);
    setIsComplete(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(0);
    setPreviousScore(0);
    setShowIntroduction(true);
    
    // Clear localStorage
    clearQuestionnaireStorage();
  }, []);

  const saveInvestmentProfile = async () => {
    await saveInvestmentProfileToSupabase(
      user,
      profileAnalysis,
      investmentStyleInsights,
      answers,
      score,
      setSaving,
      navigate
    );
  };

  const handleContinueToPortfolios = useCallback(() => {
    navigate("/portfolios", { state: { score } });
  }, [navigate, score]);

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
      showIntroduction,
      setShowIntroduction,
      saving,
      profileAnalysis,
      investmentStyleInsights,
      handleAnswer,
      handleRetakeQuestionnaire,
      saveInvestmentProfile,
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
