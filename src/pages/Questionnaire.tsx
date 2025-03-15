
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";
import QuestionCard, { Question } from "@/components/QuestionCard";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { getQuestions, calculateRiskScore } from "@/utils/questionnaire";

const Questionnaire = () => {
  const [questions] = useState<Question[]>(getQuestions());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { optionId: string, value: number }>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();
  
  // Function to handle user answers
  const handleAnswer = useCallback((questionId: string, optionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { optionId, value }
    }));
    
    // Auto-advance to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // If this was the last question, complete the questionnaire
        setIsComplete(true);
      }
    }, 500);
  }, [currentQuestionIndex, questions.length]);
  
  // Calculate score when questionnaire is complete
  useEffect(() => {
    if (isComplete && Object.keys(answers).length === questions.length) {
      const calculatedScore = calculateRiskScore(answers);
      setScore(calculatedScore);
      
      // Show completion toast
      toast({
        title: "Questionnaire terminé !",
        description: `Votre score de risque est de ${calculatedScore}`,
      });
      
      // Navigate to portfolios after a delay
      setTimeout(() => {
        navigate("/portfolios", { state: { score: calculatedScore } });
      }, 2000);
    }
  }, [isComplete, answers, questions.length, navigate]);
  
  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="min-h-screen bg-gradient-radial py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-2">Évaluation de votre profil d'investisseur</h1>
        <p className="text-muted-foreground text-center mb-10">
          Répondez honnêtement aux questions suivantes pour déterminer votre profil d'investissement.
        </p>
        
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
              />
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0 || isComplete}
          >
            Question précédente
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} sur {questions.length}
          </div>
          
          <Button
            onClick={() => {
              if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
              } else {
                setIsComplete(true);
              }
            }}
            disabled={!answers[currentQuestion.id] || isComplete}
          >
            {currentQuestionIndex < questions.length - 1 ? "Question suivante" : "Terminer"}
          </Button>
        </div>
        
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 bg-primary/10 p-6 rounded-lg text-center"
          >
            <h2 className="text-xl font-medium mb-2">Questionnaire terminé !</h2>
            <p>Votre score de risque est de {score}</p>
            <p className="text-muted-foreground mt-2">
              Vous allez être redirigé vers la sélection de portefeuille...
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Questionnaire;
