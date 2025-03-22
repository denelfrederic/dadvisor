
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "./LoadingSpinner";

interface CreateWalletButtonProps {
  isCreating: boolean;
  onClick: () => void;
}

const CreateWalletButton = ({ isCreating, onClick }: CreateWalletButtonProps) => {
  const [showSoon, setShowSoon] = useState(false);
  
  const handleClick = () => {
    setShowSoon(true);
    // Appel de la fonction onClick originale après un délai
    setTimeout(() => {
      onClick();
      // Réinitialiser après 2 secondes
      setTimeout(() => setShowSoon(false), 2000);
    }, 500);
  };

  return (
    <Button 
      className="w-full" 
      onClick={handleClick}
      disabled={isCreating}
    >
      {isCreating ? (
        <>
          <LoadingSpinner />
          Création en cours...
        </>
      ) : showSoon ? (
        "Bientôt"
      ) : (
        "Créer un coffre numérique"
      )}
    </Button>
  );
};

export default CreateWalletButton;
