
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Interface pour une option de réponse
 * @param id - Identifiant unique de l'option
 * @param text - Texte de l'option à afficher
 * @param value - Valeur numérique associée à l'option (pour le calcul du score)
 */
export interface Option {
  id: string;
  text: string;
  value: number;
}

/**
 * Interface pour une question du questionnaire
 * @param id - Identifiant unique de la question
 * @param text - Texte de la question
 * @param options - Option[] - Liste des options de réponse disponibles
 */
export interface Question {
  id: string;
  text: string;
  options: Option[];
}

/**
 * Interface pour les propriétés du composant QuestionCard
 * @param question - Objet contenant les données de la question
 * @param onAnswer - Fonction de rappel appelée lorsque l'utilisateur sélectionne une réponse
 * @param isAnswered - Indique si la question a déjà reçu une réponse
 * @param selectedOptionId - ID de l'option actuellement sélectionnée (si applicable)
 * @param previousScore - Score avant la réponse à cette question
 * @param currentScore - Score actuel après la réponse
 */
interface QuestionCardProps {
  question: Question;
  onAnswer: (questionId: string, optionId: string, value: number) => void;
  isAnswered?: boolean;
  selectedOptionId?: string;
  previousScore?: number;
  currentScore?: number;
}

/**
 * Composant QuestionCard - Carte affichant une question et ses options de réponse
 * Utilisé dans le questionnaire d'évaluation du profil d'investisseur
 */
const QuestionCard = ({ 
  question, 
  onAnswer, 
  isAnswered = false,
  selectedOptionId,
  previousScore,
  currentScore
}: QuestionCardProps) => {
  const [selected, setSelected] = useState<string | null>(selectedOptionId || null);
  const [isAnimating, setIsAnimating] = useState(false);
  const isMobile = useIsMobile();

  // Gère la sélection d'une option par l'utilisateur
  const handleOptionSelect = (optionId: string, value: number) => {
    setSelected(optionId);
    setIsAnimating(true);
    
    // Délai pour permettre à l'animation de se terminer
    setTimeout(() => {
      onAnswer(question.id, optionId, value);
      setIsAnimating(false);
    }, 400);
  };

  // Calcule la différence de score
  const scoreDifference = (currentScore !== undefined && previousScore !== undefined) 
    ? currentScore - previousScore 
    : null;

  return (
    <motion.div 
      className="glass-card p-4 sm:p-6 rounded-2xl w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6">{question.text}</h3>
      
      <div className="space-y-2 sm:space-y-3">
        {question.options.map((option) => (
          <OptionButton
            key={option.id}
            option={option}
            isSelected={selected === option.id}
            isDisabled={isAnswered || isAnimating}
            onSelect={handleOptionSelect}
          />
        ))}
      </div>

      {/* Affichage de l'évolution du score */}
      {scoreDifference !== null && (
        <motion.div 
          className="mt-3 sm:mt-4 p-2 sm:p-3 bg-[#ea384c]/10 border border-[#ea384c] rounded-lg text-[#ea384c] font-medium"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            {scoreDifference > 0 ? (
              <>
                <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{isMobile ? "+"+scoreDifference.toFixed(1) : "Score augmenté de "+scoreDifference.toFixed(1)+" points"}</span>
              </>
            ) : scoreDifference < 0 ? (
              <>
                <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>{isMobile ? Math.abs(scoreDifference).toFixed(1) : "Score diminué de "+Math.abs(scoreDifference).toFixed(1)+" points"}</span>
              </>
            ) : (
              <span>Score inchangé</span>
            )}
            <span className="ml-auto font-bold">Score: {currentScore?.toFixed(1)}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

/**
 * Interface pour les propriétés du composant OptionButton
 * @param option - Objet contenant les données de l'option
 * @param isSelected - Indique si l'option est actuellement sélectionnée
 * @param isDisabled - Indique si le bouton est désactivé
 * @param onSelect - Fonction de rappel appelée lorsque l'option est sélectionnée
 */
interface OptionButtonProps {
  option: Option;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (optionId: string, value: number) => void;
}

/**
 * Composant OptionButton - Bouton représentant une option de réponse
 * Composant interne utilisé par QuestionCard
 */
const OptionButton = ({ option, isSelected, isDisabled, onSelect }: OptionButtonProps) => {
  return (
    <motion.div
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
    >
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left py-3 px-3 sm:p-4 h-auto min-h-[60px] sm:min-h-[70px] text-xs sm:text-sm transition-all duration-300",
          isSelected && "border-primary bg-primary/5"
        )}
        onClick={() => onSelect(option.id, option.value)}
        disabled={isDisabled}
      >
        <div className="flex items-start sm:items-center gap-2 sm:gap-3">
          {/* Indicateur de sélection (bouton radio) */}
          <div className={cn(
            "min-w-4 h-4 sm:min-w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 sm:mt-0",
            isSelected ? "border-primary" : "border-muted"
          )}>
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </AnimatePresence>
          </div>
          <span className="flex-1 break-words">{option.text}</span>
        </div>
      </Button>
    </motion.div>
  );
};

export default QuestionCard;
