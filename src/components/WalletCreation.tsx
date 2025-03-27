
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import WalletInfo from "./wallet/WalletInfo";
import CreateWalletButton from "./wallet/CreateWalletButton";

interface WalletCreationProps {
  onWalletCreated: (walletAddress: string) => void;
}

const WalletCreation = ({ onWalletCreated }: WalletCreationProps) => {
  const [isCreating, setIsCreating] = useState(false);
  
  // Fonction vide qui ne fait rien, pour satisfaire les props du bouton
  const handleCreateWallet = () => {
    // Ne fait rien
    console.log("Fonctionnalité de création de coffre numérique non disponible");
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Coffre numérique</CardTitle>
          <CardDescription>
            Créez un coffre numérique décentralisé pour gérer vos investissements en toute sécurité.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WalletInfo />
        </CardContent>
        <CardFooter>
          <CreateWalletButton isCreating={isCreating} onClick={handleCreateWallet} />
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default WalletCreation;
