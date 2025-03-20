
import { questions } from "@/utils/questionnaire";
import { useQuestionnaire } from "@/contexts/questionnaire";
import { motion } from "framer-motion";
import ProgressBar from "@/components/ProgressBar";
import QuestionCard from "@/components/QuestionCard";
import { AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";

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
  const currentQuestion = questions[currentQuestionIndex];

  // Ajout d'un effet pour rediriger automatiquement après un délai
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        setShowAnalysis(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isComplete, setShowAnalysis]);

  if (isComplete) {
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

  return (
    <>
      <ProgressBar 
        currentStep={currentQuestionIndex + 1} 
        totalSteps={questions.length}
        labels={isMobile ? 
          questions.map((_, index) => `${index + 1}`) : 
          questions.map((_, index) => `Question ${index + 1}`)}
      />
      
      <div className="mb-6 sm:mb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <QuestionCard
              question={currentQuestion}
              onAnswer={handleAnswer}
              isAnswered={false} // Toujours permettre de modifier les réponses
              selectedOptionId={answers[currentQuestion.id]?.optionId}
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
