
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

  // Restaurer les données depuis localStorage au chargement
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

  // Sauvegarder dans localStorage lorsque les réponses changent
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      saveAnswersToStorage(answers);
      // Ajouter la valeur textuelle à chaque réponse pour permettre l'analyse textuelle
      const answersWithText = { ...answers };
      Object.keys(answersWithText).forEach(questionId => {
        const question = questions.find(q => q.id === questionId);
        if (question) {
          const option = question.options.find(opt => opt.id === answersWithText[questionId].optionId);
          if (option) {
            answersWithText[questionId] = {
              ...answersWithText[questionId],
              text: option.text
            };
          }
        }
      });
      localStorage.setItem('dadvisor_temp_answers', JSON.stringify(answersWithText));
    }
  }, [answers]);

  // Sauvegarder le score et l'état de complétion dans localStorage
  useEffect(() => {
    saveScoreToStorage(score);
    saveCompleteStatusToStorage(isComplete);
  }, [score, isComplete]);

  // Calculer le score lorsque les réponses changent
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
    
    // Trouver la question et l'option pour stocker le texte de la réponse
    const question = questions.find(q => q.id === questionId);
    const option = question?.options.find(opt => opt.id === optionId);
    
    // Update answers
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: { 
          optionId, 
          value,
          text: option?.text || "" // Stocker également le texte de la réponse
        }
      };
      
      // Mettre à jour le score actuel
      setScore(calculateRiskScore(newAnswers));
      
      return newAnswers;
    });
    
    // Automatically advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Si c'était la dernière question, terminer le questionnaire
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
    
    // Effacer localStorage
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
    console.log("Redirection vers les portefeuilles avec:", {
      score,
      answers
    });
    
    // Enrichir les réponses avec le texte des options sélectionnées
    const enrichedAnswers = { ...answers };
    Object.keys(enrichedAnswers).forEach(questionId => {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        const option = question.options.find(opt => opt.id === enrichedAnswers[questionId].optionId);
        if (option) {
          enrichedAnswers[questionId] = {
            ...enrichedAnswers[questionId],
            text: option.text
          };
        }
      }
    });
    
    // Transmettre à la fois le score et les réponses au questionnaire
    navigate("/portfolios", { state: { score, answers: enrichedAnswers } });
  }, [navigate, score, answers]);

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
