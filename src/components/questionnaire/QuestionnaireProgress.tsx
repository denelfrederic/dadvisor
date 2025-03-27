
import { questions } from "@/utils/questionnaire";
import { useQuestionnaire } from "@/contexts/questionnaire";
import { motion } from "framer-motion";
import ProgressBar from "@/components/ProgressBar";
import QuestionCard from "@/components/QuestionCard";
import { AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

const QuestionnaireProgress = () => {
  const { 
    currentQuestionIndex, 
    handleAnswer, 
    answers, 
    previousScore, 
    score, 
    isComplete,
    setShowAnalysis
  } = useQuestionnaire();
  
  const isMobile = useIsMobile();
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  
  // Vérification que currentQuestionIndex est valide
  const safeIndex = Math.min(Math.max(0, currentQuestionIndex || 0), questions.length - 1);
  const currentQuestion = questions[safeIndex];
  const totalQuestions = questions.length;

  // Effet pour gérer l'affichage du message de complétion et la redirection
  useEffect(() => {
    if (isComplete && !showCompletionMessage) {
      console.log("Questionnaire complet, affichage du message de complétion");
      setShowCompletionMessage(true);
      
      // Redirection après délai
      const timer = setTimeout(() => {
        console.log("Redirection vers l'analyse après 2 secondes");
        setShowAnalysis(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isComplete, setShowAnalysis, showCompletionMessage]);

  // Si le message de complétion doit être affiché
  if (showCompletionMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 sm:mt-10 bg-primary/10 p-4 sm:p-6 rounded-lg text-center"
      >
        <h2 className="text-lg sm:text-xl font-medium mb-2">Questionnaire terminé !</h2>
        <p className="text-sm sm:text-base">Votre score de risque est de {score}</p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
          Vous allez être redirigé vers l'analyse détaillée...
        </p>
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

  return (
    <>
      <ProgressBar 
        currentStep={safeIndex + 1} 
        totalSteps={totalQuestions}
        labels={isMobile ? 
          Array.from({ length: totalQuestions }, (_, index) => `${index + 1}`) : 
          Array.from({ length: totalQuestions }, (_, index) => `Question ${index + 1}`)}
      />
      
      <div className="mb-6 sm:mb-10">
        <AnimatePresence mode="wait">
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
              previousScore={previousScore}
              currentScore={score}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default QuestionnaireProgress;
