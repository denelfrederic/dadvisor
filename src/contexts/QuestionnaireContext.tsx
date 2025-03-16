
import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { calculateRiskScore, getInvestorProfileAnalysis, analyzeInvestmentStyle, questions, InvestorProfileAnalysis } from "@/utils/questionnaire";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

type QuestionnaireResponses = Record<string, { optionId: string, value: number }>;

interface QuestionnaireContextType {
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

const QuestionnaireContext = createContext<QuestionnaireContextType | undefined>(undefined);

// Clés pour le localStorage
const TEMP_ANSWERS_KEY = "dadvisor_temp_answers";
const TEMP_SCORE_KEY = "dadvisor_temp_score";
const TEMP_COMPLETE_KEY = "dadvisor_temp_complete";

export const QuestionnaireProvider = ({ children }: { children: ReactNode }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireResponses>({});
  const [previousScore, setPreviousScore] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStatus();
  
  // Compute derived state
  const profileAnalysis = isComplete ? getInvestorProfileAnalysis(score, answers) : null;
  const investmentStyleInsights = isComplete ? analyzeInvestmentStyle(answers) : [];

  // Restaurer les données depuis localStorage au chargement
  useEffect(() => {
    const savedAnswers = localStorage.getItem(TEMP_ANSWERS_KEY);
    const savedScore = localStorage.getItem(TEMP_SCORE_KEY);
    const savedComplete = localStorage.getItem(TEMP_COMPLETE_KEY);
    
    if (savedAnswers) {
      try {
        const parsedAnswers = JSON.parse(savedAnswers) as QuestionnaireResponses;
        setAnswers(parsedAnswers);
      } catch (e) {
        console.error("Error parsing saved answers:", e);
      }
    }
    
    if (savedScore) {
      try {
        const parsedScore = JSON.parse(savedScore) as number;
        setScore(parsedScore);
      } catch (e) {
        console.error("Error parsing saved score:", e);
      }
    }
    
    if (savedComplete) {
      try {
        const parsedComplete = JSON.parse(savedComplete) as boolean;
        setIsComplete(parsedComplete);
        if (parsedComplete) {
          setShowAnalysis(true);
        }
      } catch (e) {
        console.error("Error parsing saved complete status:", e);
      }
    }
  }, []);

  // Sauvegarder dans localStorage quand les réponses changent
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(TEMP_ANSWERS_KEY, JSON.stringify(answers));
    }
  }, [answers]);

  // Sauvegarder score et statut complet dans localStorage
  useEffect(() => {
    localStorage.setItem(TEMP_SCORE_KEY, JSON.stringify(score));
    localStorage.setItem(TEMP_COMPLETE_KEY, JSON.stringify(isComplete));
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
    // Sauvegarde du score précédent
    const oldAnswers = { ...answers };
    setPreviousScore(calculateRiskScore(oldAnswers));
    
    // Mise à jour des réponses
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: { optionId, value }
      };
      
      // Mise à jour du score actuel
      setScore(calculateRiskScore(newAnswers));
      
      return newAnswers;
    });
    
    // Avance automatiquement à la question suivante après un court délai
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Si c'était la dernière question, termine le questionnaire
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
    
    // Nettoyer localStorage
    localStorage.removeItem(TEMP_ANSWERS_KEY);
    localStorage.removeItem(TEMP_SCORE_KEY);
    localStorage.removeItem(TEMP_COMPLETE_KEY);
  }, []);

  const saveInvestmentProfile = async () => {
    if (!user) {
      // Sauvegarder l'état actuel dans localStorage avant la redirection
      localStorage.setItem(TEMP_ANSWERS_KEY, JSON.stringify(answers));
      localStorage.setItem(TEMP_SCORE_KEY, JSON.stringify(score));
      localStorage.setItem(TEMP_COMPLETE_KEY, JSON.stringify(isComplete));
      
      toast({
        variant: "destructive",
        title: "Connexion requise",
        description: "Vous devez être connecté pour sauvegarder votre profil d'investisseur."
      });
      navigate("/auth");
      return;
    }

    if (!profileAnalysis) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder le profil, analyse non disponible."
      });
      return;
    }

    setSaving(true);
    
    try {
      // Détermine le type de profil
      let profileType = "balanced";
      if (score < 40) profileType = "conservative";
      else if (score >= 70) profileType = "growth";

      // Prepare data for Supabase (with correct typing)
      const profileDataForDb: Json = {
        analysis: profileAnalysis as unknown as Json,
        investmentStyleInsights: investmentStyleInsights as unknown as Json,
        answers: answers as unknown as Json
      };

      // Crée l'objet de données pour la sauvegarde
      const profileData = {
        user_id: user.id,
        score: Math.round(score),
        profile_type: profileType,
        profile_data: profileDataForDb
      };

      // Vérifie si l'utilisateur a déjà un profil
      const { data: existingProfile } = await supabase
        .from('investment_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      
      if (existingProfile) {
        // Met à jour le profil existant
        result = await supabase
          .from('investment_profiles')
          .update(profileData)
          .eq('user_id', user.id);
      } else {
        // Crée un nouveau profil
        result = await supabase
          .from('investment_profiles')
          .insert(profileData);
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Profil sauvegardé",
        description: "Votre profil d'investisseur a été sauvegardé avec succès."
      });

      // Nettoyer le localStorage après sauvegarde réussie
      localStorage.removeItem(TEMP_ANSWERS_KEY);
      localStorage.removeItem(TEMP_SCORE_KEY);
      localStorage.removeItem(TEMP_COMPLETE_KEY);

      // Redirige vers la page d'analyse du profil
      navigate("/profile");
      
    } catch (error: any) {
      console.error("Error saving investment profile:", error);
      toast({
        variant: "destructive",
        title: "Erreur de sauvegarde",
        description: error.message || "Une erreur est survenue lors de la sauvegarde de votre profil."
      });
    } finally {
      setSaving(false);
    }
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
