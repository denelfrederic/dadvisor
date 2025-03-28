
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
    score, 
    setPreviousScore,
    setIsComplete
  } = useQuestionnaire();
  
  const isMobile = useIsMobile();
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex justify-between items-center mt-4">
      <Button
        variant="outline"
        onClick={() => {
          if (currentQuestionIndex > 0) {
            const previousQuestionIndex = currentQuestionIndex - 1;
            setCurrentQuestionIndex(previousQuestionIndex);
          }
        }}
        disabled={currentQuestionIndex === 0 || isComplete}
        className="text-[11px] sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
      >
        {isMobile ? "Préc." : "Question précédente"}
      </Button>
      
      <div className="text-xs sm:text-sm text-muted-foreground">
        {currentQuestionIndex + 1}/{questions.length}
      </div>
      
      <Button
        onClick={() => {
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
          } else {
            setIsComplete(true);
          }
        }}
        disabled={!answers[currentQuestion.id] || isComplete}
        className="text-[11px] sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
      >
        {isMobile ? "Suiv." : currentQuestionIndex < questions.length - 1 ? "Question suivante" : "Terminer"}
      </Button>
    </div>
  );
};

export default QuestionnaireNavigation;
