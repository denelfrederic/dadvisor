
import { questions } from "@/utils/questionnaire";
import { useQuestionnaire } from "@/contexts/QuestionnaireContext";
import { motion } from "framer-motion";
import ProgressBar from "@/components/ProgressBar";
import QuestionCard from "@/components/QuestionCard";
import { AnimatePresence } from "framer-motion";

const QuestionnaireProgress = () => {
  const { 
    currentQuestionIndex, 
    handleAnswer, 
    answers, 
    previousScore, 
    score, 
    isComplete 
  } = useQuestionnaire();

  const currentQuestion = questions[currentQuestionIndex];

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 bg-primary/10 p-6 rounded-lg text-center"
      >
        <h2 className="text-xl font-medium mb-2">Questionnaire terminé !</h2>
        <p>Votre score de risque est de {score}</p>
        <p className="text-muted-foreground mt-2">
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
        labels={questions.map((_, index) => `Question ${index + 1}`)}
      />
      
      <div className="mb-10">
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
              isAnswered={!!answers[currentQuestion.id]}
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
