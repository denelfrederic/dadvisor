
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";

interface CreateWalletButtonProps {
  isCreating: boolean;
  onClick: () => void;
}

const CreateWalletButton = ({ isCreating, onClick }: CreateWalletButtonProps) => {
  const [showDialog, setShowDialog] = useState(false);
  
  const handleClick = () => {
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    toast({
      title: "Merci pour votre intérêt !",
      description: "Nous vous préviendrons dès que le coffre numérique sera disponible.",
    });
  };

  return (
    <>
      <Button 
        className="w-full" 
        onClick={handleClick}
      >
        Créer un coffre numérique
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>En cours de développement</AlertDialogTitle>
            <AlertDialogDescription>
              Ce n'est pas encore prêt mais si vous créez un compte pour sauvegarder votre profil d'investisseur vous serez les premiers prévenus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseDialog}>
              Compris
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CreateWalletButton;
