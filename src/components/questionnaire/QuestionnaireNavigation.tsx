
import { Button } from "@/components/ui/button";
import { useQuestionnaire } from "@/contexts/QuestionnaireContext";
import { questions } from "@/utils/questionnaire";

const QuestionnaireNavigation = () => {
  const { 
    currentQuestionIndex, 
    setCurrentQuestionIndex, 
    answers, 
    isComplete, 
    score, 
    setPreviousScore 
  } = useQuestionnaire();

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex justify-between items-center">
      <Button
        variant="outline"
        onClick={() => {
          if (currentQuestionIndex > 0) {
            const previousQuestionIndex = currentQuestionIndex - 1;
            setCurrentQuestionIndex(previousQuestionIndex);
          }
        }}
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
  );
};

export default QuestionnaireNavigation;
