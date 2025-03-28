
import { questions } from "@/utils/questionnaire";
import { useQuestionnaire } from "@/contexts/questionnaire";
import { motion, AnimatePresence } from "framer-motion";
import ProgressBar from "@/components/ProgressBar";
import QuestionCard from "@/components/QuestionCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState, useMemo, memo } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/**
 * Composant d'affichage de la progression du questionnaire
 * Gère l'affichage des questions, la barre de progression et le message de complétion
 * Optimisé pour réduire les scintillements et les re-rendus inutiles
 */
const QuestionnaireProgress = memo(() => {
  const { 
    currentQuestionIndex, 
    handleAnswer, 
    answers, 
    isComplete,
    setShowAnalysis
  } = useQuestionnaire();
  
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  // Mémoisation de l'index sécurisé et de la question actuelle
  const safeIndex = useMemo(() => 
    Math.min(Math.max(0, currentQuestionIndex || 0), questions.length - 1), 
    [currentQuestionIndex]
  );
  
  const currentQuestion = useMemo(() => questions[safeIndex], [safeIndex]);
  const totalQuestions = questions.length;

  // Effet pour gérer l'affichage du message de complétion et la redirection
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isComplete && !showCompletionMessage) {
      console.log("Questionnaire complet, affichage du message de complétion");
      setShowCompletionMessage(true);
      setRedirectAttempted(false);
      
      // Redirection après délai
      timer = setTimeout(() => {
        console.log("Redirection vers l'analyse après 2 secondes");
        setRedirectAttempted(true);
        
        try {
          // Double méthode de redirection pour garantir la fiabilité
          setShowAnalysis(true);
          
          // Si après 500ms l'analyse n'est pas affichée, forcer la navigation
          setTimeout(() => {
            if (showCompletionMessage) {
              console.log("Redirection secondaire vers profile-analysis");
              navigate("/profile-analysis");
              // Réinitialiser l'état du message de complétion après la redirection
              setShowCompletionMessage(false);
            }
          }, 500);
        } catch (error) {
          console.error("Erreur lors de la redirection:", error);
          // En cas d'erreur, forcer la navigation
          navigate("/profile-analysis");
          setShowCompletionMessage(false);
        }
      }, 2000);
    }
    
    // Nettoyage du timer si le composant est démonté ou si isComplete change
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isComplete, setShowAnalysis, showCompletionMessage, navigate]);

  // Effet de secours si le message persiste trop longtemps
  useEffect(() => {
    let backupTimer: NodeJS.Timeout;
    
    if (showCompletionMessage && redirectAttempted) {
      // Si après 3 secondes on est toujours sur le message de complétion, forcer la navigation
      backupTimer = setTimeout(() => {
        console.log("Mécanisme de secours activé pour la redirection");
        toast.info("Redirection en cours...");
        navigate("/profile-analysis");
        setShowCompletionMessage(false);
      }, 3000);
    }
    
    return () => {
      if (backupTimer) {
        clearTimeout(backupTimer);
      }
    };
  }, [showCompletionMessage, redirectAttempted, navigate]);

  // Si le message de complétion doit être affiché
  if (showCompletionMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 sm:mt-10 bg-primary/10 p-4 sm:p-6 rounded-lg text-center"
      >
        <h2 className="text-lg sm:text-xl font-medium mb-2">Questionnaire terminé !</h2>
        <p className="text-sm sm:text-base">Vous allez être redirigé vers l'analyse détaillée...</p>
        
        {redirectAttempted && (
          <button 
            onClick={() => navigate("/profile-analysis")} 
            className="mt-4 text-sm text-primary underline"
          >
            Cliquer ici si la redirection ne se fait pas automatiquement
          </button>
        )}
      </motion.div>
    );
  }

  // Vérification si currentQuestion existe
  if (!currentQuestion) {
    console.error("Erreur: Question actuelle non trouvée. Index:", currentQuestionIndex, "Safe index:", safeIndex);
    return (
      <div className="text-center p-6 bg-red-100 rounded-lg">
        <p className="text-red-600">Erreur: Impossible de charger la question actuelle.</p>
        <p className="text-sm text-gray-600 mt-2">Veuillez rafraîchir la page ou contacter le support.</p>
      </div>
    );
  }

  // Génération des étiquettes pour la barre de progression
  const progressLabels = useMemo(() => 
    isMobile ? 
      Array.from({ length: totalQuestions }, (_, index) => `${index + 1}`) : 
      Array.from({ length: totalQuestions }, (_, index) => `Question ${index + 1}`),
    [totalQuestions, isMobile]
  );

  return (
    <>
      <ProgressBar 
        currentStep={safeIndex + 1} 
        totalSteps={totalQuestions}
        labels={progressLabels}
      />
      
      <div className="mb-6 sm:mb-10">
        <motion.div
          key={safeIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <QuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            isAnswered={false}
            selectedOptionId={answers && answers[currentQuestion.id]?.optionId}
          />
        </motion.div>
      </div>
    </>
  );
});

QuestionnaireProgress.displayName = 'QuestionnaireProgress';

export default QuestionnaireProgress;
