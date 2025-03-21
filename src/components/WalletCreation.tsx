
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
  
  const handleCreateWallet = async () => {
    setIsCreating(true);
    
    try {
      // Call to the Ibex API to create a wallet
      const response = await fetch("https://api-testnet.ibexwallet.org/api/v1/wallets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network: "ethereum"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create wallet");
      }

      const data = await response.json();
      const walletAddress = data.address;
      
      // Pass the wallet address to the parent component
      onWalletCreated(walletAddress);
    } catch (error) {
      console.error("Failed to create wallet:", error);
    } finally {
      setIsCreating(false);
    }
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
