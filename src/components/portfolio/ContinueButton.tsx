
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

/**
 * Interface pour les propriétés du composant ContinueButton
 */
interface ContinueButtonProps {
  onClick: () => void;
  disabled: boolean;
}

/**
 * Bouton pour continuer avec le portefeuille sélectionné
 */
const ContinueButton: React.FC<ContinueButtonProps> = ({ onClick, disabled }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex justify-center"
    >
      <Button 
        size="lg" 
        onClick={onClick} 
        disabled={disabled}
      >
        Continuer avec ce portefeuille
      </Button>
    </motion.div>
  );
};

export default ContinueButton;
