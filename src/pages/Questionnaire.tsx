
import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";
import QuestionCard, { Question } from "@/components/QuestionCard";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { questions, calculateRiskScore, getInvestorProfileAnalysis, analyzeInvestmentStyle } from "@/utils/questionnaire";
import { Home, PieChart, ArrowRight, RefreshCw } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

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
  const [showAnalysis, setShowAnalysis] = useState(false);
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
      
      // Affiche l'analyse détaillée
      setShowAnalysis(true);
    }
  }, [isComplete, answers, questions.length, navigate]);
  
  // Récupère la question actuelle
  const currentQuestion = questions[currentQuestionIndex];
  
  // Obtient l'analyse du profil d'investisseur
  const profileAnalysis = isComplete ? getInvestorProfileAnalysis(score, answers) : null;
  const investmentStyleInsights = isComplete ? analyzeInvestmentStyle(answers) : [];
  
  // Fonction pour continuer vers les portefeuilles
  const handleContinueToPortfolios = () => {
    navigate("/portfolios", { state: { score } });
  };
  
  // Données pour le graphique d'allocation
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
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
        
        {!showAnalysis && (
          <>
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
          </>
        )}
        
        {/* Message de complétion du questionnaire */}
        {isComplete && !showAnalysis && (
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
        
        {/* Analyse détaillée du profil d'investisseur */}
        {showAnalysis && profileAnalysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-card border shadow-sm rounded-xl p-6 mb-10">
              <div className="flex items-center gap-3 mb-4">
                <PieChart className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Analyse de votre profil d'investisseur</h2>
              </div>
              
              <div className="mb-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-primary mb-3">{profileAnalysis.title}</h3>
                    <p className="text-muted-foreground mb-4">{profileAnalysis.description}</p>
                    
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Score de tolérance au risque</h4>
                      <div className="bg-muted h-5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-1000"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span>Conservateur</span>
                        <span>Équilibré</span>
                        <span>Croissance</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Caractéristiques de votre profil</h4>
                      <ul className="space-y-2">
                        {profileAnalysis.traits.map((trait, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                              •
                            </div>
                            <span>{trait}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-64 h-64">
                    <h4 className="font-medium mb-2 text-center">Allocation recommandée</h4>
                    <ChartContainer config={{}} className="h-56">
                      <RechartsPieChart>
                        <Pie
                          data={profileAnalysis.allocation}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {profileAnalysis.allocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ChartContainer>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="font-medium mb-2">Investissements adaptés</h4>
                  <ul className="space-y-1">
                    {profileAnalysis.suitableInvestments.map((investment, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span>{investment}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Risques à considérer</h4>
                  <ul className="space-y-1">
                    {profileAnalysis.risksToConsider.map((risk, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg mb-8">
                <h4 className="font-medium mb-2">Insights personnalisés sur votre style d'investissement</h4>
                <ul className="space-y-3">
                  {investmentStyleInsights.map((insight, index) => (
                    <li key={index} className="text-sm">
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-center mt-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAnalysis(false);
                      setIsComplete(false);
                      setCurrentQuestionIndex(0);
                      setAnswers({});
                      setScore(0);
                      setPreviousScore(0);
                    }}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Recommencer le questionnaire
                  </Button>
                  
                  <Button 
                    onClick={handleContinueToPortfolios}
                    className="flex items-center gap-2"
                  >
                    Découvrir les portefeuilles recommandés
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 text-center text-xs text-muted-foreground">
                <p>Rappel : DADVISOR vous aide à comprendre votre profil d'investisseur mais ne gère jamais vos fonds.</p>
                <p>Vous gardez à tout moment le contrôle total de vos investissements.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Questionnaire;
