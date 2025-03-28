
import React from "react";
import { Button } from "@/components/ui/button";
import { useQuestionnaire } from "@/contexts/questionnaire";
import { questions } from "@/utils/questionnaire";
import { useIsMobile } from "@/hooks/use-mobile";

const QuestionnaireNavigation = () => {
  const { 
    currentQuestionIndex, 
    setCurrentQuestionIndex, 
    answers, 
    isComplete, 
    setIsComplete
  } = useQuestionnaire();
  
  const isMobile = useIsMobile();
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Gestion améliorée des clics sur le bouton suivant
  const handleNextClick = React.useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsComplete(true);
    }
  }, [currentQuestionIndex, setCurrentQuestionIndex, setIsComplete]);

  // Gestion améliorée des clics sur le bouton précédent
  const handlePreviousClick = React.useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex, setCurrentQuestionIndex]);

  // Déterminer si le bouton suivant est désactivé
  const isNextDisabled = !answers[currentQuestion?.id] || isComplete;

  return (
    <div className="flex justify-between items-center mt-4">
      <Button
        variant="outline"
        onClick={handlePreviousClick}
        disabled={currentQuestionIndex === 0 || isComplete}
        className="text-[11px] sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
      >
        {isMobile ? "Préc." : "Question précédente"}
      </Button>
      
      <div className="text-xs sm:text-sm text-muted-foreground">
        {currentQuestionIndex + 1}/{questions.length}
      </div>
      
      <Button
        onClick={handleNextClick}
        disabled={isNextDisabled}
        className="text-[11px] sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
      >
        {isMobile ? "Suiv." : isLastQuestion ? "Terminer" : "Question suivante"}
      </Button>
    </div>
  );
};

export default QuestionnaireNavigation;
