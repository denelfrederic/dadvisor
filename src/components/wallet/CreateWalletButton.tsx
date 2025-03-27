
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface CreateWalletButtonProps {
  isCreating: boolean;
  onClick: () => void;
}

/**
 * Bouton de création de coffre numérique
 * Affiche un dialogue indiquant que la fonctionnalité est en cours de développement
 */
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>En cours de développement</DialogTitle>
            <DialogDescription>
              Ce n'est pas encore prêt mais si vous avez laissé votre mail en sauvegardant votre profil vous serez prévenu avant les autres !
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCloseDialog}>
              Compris
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateWalletButton;
