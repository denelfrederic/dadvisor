
import { Button } from "@/components/ui/button";
import { useQuestionnaire } from "@/contexts/questionnaire";
import { questions } from "@/utils/questionnaire";
import { useIsMobile } from "@/hooks/use-mobile";
import { memo, useCallback } from "react";

/**
 * Composant de navigation du questionnaire
 * Affiche les boutons pour naviguer entre les questions
 * Memoizé pour éviter les re-rendus inutiles
 */
const QuestionnaireNavigation = memo(() => {
  const { 
    currentQuestionIndex, 
    setCurrentQuestionIndex, 
    answers, 
    isComplete, 
    setPreviousScore,
    setIsComplete
  } = useQuestionnaire();
  
  const isMobile = useIsMobile();
  const currentQuestion = questions[currentQuestionIndex];

  // Callbacks mémorisés pour éviter les re-rendus
  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      const previousQuestionIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(previousQuestionIndex);
    }
  }, [currentQuestionIndex, setCurrentQuestionIndex]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsComplete(true);
    }
  }, [currentQuestionIndex, setCurrentQuestionIndex, setIsComplete]);

  // Texte pour le bouton suivant, mémorisé pour éviter les re-rendus
  const nextButtonText = isMobile 
    ? "Suiv." 
    : currentQuestionIndex < questions.length - 1 
      ? "Question suivante" 
      : "Terminer";

  return (
    <div className="flex justify-between items-center mt-4">
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={currentQuestionIndex === 0 || isComplete}
        className="text-[11px] sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
      >
        {isMobile ? "Préc." : "Question précédente"}
      </Button>
      
      <div className="text-xs sm:text-sm text-muted-foreground">
        {currentQuestionIndex + 1}/{questions.length}
      </div>
      
      <Button
        onClick={handleNext}
        disabled={!answers[currentQuestion.id] || isComplete}
        className="text-[11px] sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
      >
        {nextButtonText}
      </Button>
    </div>
  );
});

QuestionnaireNavigation.displayName = 'QuestionnaireNavigation';

export default QuestionnaireNavigation;
