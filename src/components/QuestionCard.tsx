
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Option {
  id: string;
  text: string;
  value: number;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
}

interface QuestionCardProps {
  question: Question;
  onAnswer: (questionId: string, optionId: string, value: number) => void;
  isAnswered?: boolean;
  selectedOptionId?: string;
}

const QuestionCard = ({ 
  question, 
  onAnswer, 
  isAnswered = false,
  selectedOptionId 
}: QuestionCardProps) => {
  const [selected, setSelected] = useState<string | null>(selectedOptionId || null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleOptionSelect = (optionId: string, value: number) => {
    setSelected(optionId);
    setIsAnimating(true);
    
    // Delay the answer to allow animation to complete
    setTimeout(() => {
      onAnswer(question.id, optionId, value);
      setIsAnimating(false);
    }, 400);
  };

  return (
    <motion.div 
      className="glass-card p-6 rounded-2xl w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-medium mb-6">{question.text}</h3>
      
      <div className="space-y-3">
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
};

interface OptionButtonProps {
  option: Option;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (optionId: string, value: number) => void;
}

const OptionButton = ({ option, isSelected, isDisabled, onSelect }: OptionButtonProps) => {
  return (
    <motion.div
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
    >
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left p-4 h-auto transition-all duration-300",
          isSelected && "border-primary bg-primary/5"
        )}
        onClick={() => onSelect(option.id, option.value)}
        disabled={isDisabled}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
            isSelected ? "border-primary" : "border-muted"
          )}>
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  className="w-3 h-3 rounded-full bg-primary"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </AnimatePresence>
          </div>
          <span>{option.text}</span>
        </div>
      </Button>
    </motion.div>
  );
};

export default QuestionCard;
