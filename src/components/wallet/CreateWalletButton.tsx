
import React from "react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "./LoadingSpinner";

interface CreateWalletButtonProps {
  isCreating: boolean;
  onClick: () => void;
}

const CreateWalletButton = ({ isCreating, onClick }: CreateWalletButtonProps) => (
  <Button 
    className="w-full" 
    onClick={onClick}
    disabled={isCreating}
  >
    {isCreating ? (
      <>
        <LoadingSpinner />
        Création en cours...
      </>
    ) : (
      "Créer un wallet"
    )}
  </Button>
);

export default CreateWalletButton;
