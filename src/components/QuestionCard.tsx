
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
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
 * @param previousScore - Score avant la réponse à cette question (non affiché)
 * @param currentScore - Score actuel après la réponse (non affiché)
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
 * Optimisé pour réduire les re-rendus et éviter les scintillements
 */
const QuestionCard = React.memo(({ 
  question, 
  onAnswer, 
  isAnswered = false,
  selectedOptionId,
}: QuestionCardProps) => {
  const [selected, setSelected] = useState<string | null>(selectedOptionId || null);
  const [isAnimating, setIsAnimating] = useState(false);
  const isMobile = useIsMobile();

  // Mettre à jour selected si selectedOptionId change
  useEffect(() => {
    if (selectedOptionId !== undefined && selectedOptionId !== selected) {
      setSelected(selectedOptionId);
    }
  }, [selectedOptionId, selected]);

  // Gère la sélection d'une option par l'utilisateur - mémorisé pour éviter les re-rendus inutiles
  const handleOptionSelect = useCallback((optionId: string, value: number) => {
    if (isAnimating || isAnswered) return;
    
    setSelected(optionId);
    setIsAnimating(true);
    
    // Délai pour permettre à l'animation de se terminer
    setTimeout(() => {
      onAnswer(question.id, optionId, value);
      setIsAnimating(false);
    }, 400);
  }, [question.id, onAnswer, isAnimating, isAnswered]);

  return (
    <motion.div 
      className="glass-card p-4 sm:p-6 rounded-2xl w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-base sm:text-xl font-medium mb-3 sm:mb-6">{question.text}</h3>
      
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
    </motion.div>
  );
});

QuestionCard.displayName = 'QuestionCard';

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
 * Mémoizé pour éviter les re-rendus inutiles
 */
const OptionButton = React.memo(({ option, isSelected, isDisabled, onSelect }: OptionButtonProps) => {
  // Fonction de clic mémorisée pour éviter les re-rendus
  const handleClick = useCallback(() => {
    if (!isDisabled) {
      onSelect(option.id, option.value);
    }
  }, [option.id, option.value, onSelect, isDisabled]);

  return (
    <motion.div
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
    >
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left py-2 px-3 sm:p-4 h-auto min-h-[50px] sm:min-h-[60px] transition-all duration-300",
          isSelected && "border-primary bg-primary/5"
        )}
        onClick={handleClick}
        disabled={isDisabled}
        type="button"
      >
        <span className="flex-1 whitespace-normal break-words text-[0.7rem] sm:text-xs leading-tight">
          {option.text}
        </span>
      </Button>
    </motion.div>
  );
});

OptionButton.displayName = 'OptionButton';

export default QuestionCard;
