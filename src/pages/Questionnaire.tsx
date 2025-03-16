
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";
import QuestionCard, { Question } from "@/components/QuestionCard";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { questions, calculateRiskScore } from "@/utils/questionnaire";
import { Home } from "lucide-react";

/**
 * Page Questionnaire - Évalue le profil d'investisseur de l'utilisateur
 * Présente une série de questions pour déterminer la tolérance au risque
 */
const Questionnaire = () => {
  // États pour gérer le questionnaire
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { optionId: string, value: number }>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [previousScore, setPreviousScore] = useState(0);
  const navigate = useNavigate();
  
  /**
   * Gère la sélection d'une réponse par l'utilisateur
   * @param questionId - ID de la question répondue
   * @param optionId - ID de l'option sélectionnée
   * @param value - Valeur numérique associée à l'option
   */
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
  }, [currentQuestionIndex, questions.length, answers]);
  
  // Calcule le score initial et quand le questionnaire est terminé
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const calculatedScore = calculateRiskScore(answers);
      setScore(calculatedScore);
    }
    
    if (isComplete && Object.keys(answers).length === questions.length) {
      const calculatedScore = calculateRiskScore(answers);
      setScore(calculatedScore);
      
      // Affiche une notification de fin
      toast({
        title: "Questionnaire terminé !",
        description: `Votre score de risque est de ${calculatedScore}`,
      });
      
      // Navigue vers la page des portefeuilles après un délai
      setTimeout(() => {
        navigate("/portfolios", { state: { score: calculatedScore } });
      }, 2000);
    }
  }, [isComplete, answers, questions.length, navigate]);
  
  // Récupère la question actuelle
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="min-h-screen bg-gradient-radial py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Évaluation de votre profil d'investisseur</h1>
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link to="/">
              <Home size={18} />
              Accueil
            </Link>
          </Button>
        </div>
        
        <p className="text-muted-foreground text-center mb-10">
          Répondez honnêtement aux questions suivantes pour déterminer votre profil d'investissement.
        </p>
        
        {/* Barre de progression indiquant l'avancement dans le questionnaire */}
        <ProgressBar 
          currentStep={currentQuestionIndex + 1} 
          totalSteps={questions.length}
          labels={questions.map((_, index) => `Question ${index + 1}`)}
        />
        
        <div className="mb-10">
          {/* Animation lors du changement de question */}
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
        
        {/* Navigation entre les questions */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => {
              if (currentQuestionIndex > 0) {
                const previousQuestionIndex = currentQuestionIndex - 1;
                setCurrentQuestionIndex(previousQuestionIndex);
                
                // Calculer le score précédent lorsqu'on revient à une question
                const oldAnswers = { ...answers };
                setPreviousScore(calculateRiskScore(oldAnswers));
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
                // Si on saute une question, on garde le score actuel comme précédent
                setPreviousScore(score);
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
        
        {/* Message de complétion du questionnaire */}
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
