
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

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
          <CardTitle>Wallet Ibex</CardTitle>
          <CardDescription>
            Créez un wallet décentralisé pour gérer vos investissements en toute sécurité.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-4">
                Un wallet décentralisé vous donne un contrôle total sur vos actifs numériques.
                Aucune autorité centrale ne peut bloquer votre accès ou saisir vos fonds.
              </p>
              <p className="mb-4">
                Vos clés privées sont cryptées et sécurisées par biométrie selon les 
                standards les plus élevés de l'industrie.
              </p>
              <div className="space-y-3">
                <Feature 
                  title="Sécurité maximale" 
                  description="Vos clés privées ne sont jamais partagées et restent sous votre contrôle exclusif."
                />
                <Feature 
                  title="Compatibilité multi-chaînes" 
                  description="Compatible avec les principales blockchains et tokens du marché."
                />
                <Feature 
                  title="Transactions transparentes" 
                  description="Suivez en temps réel l'état de vos transactions et votre historique."
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleCreateWallet}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <span className="mr-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                Création en cours...
              </>
            ) : (
              "Créer un wallet"
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

interface FeatureProps {
  title: string;
  description: string;
}

const Feature = ({ title, description }: FeatureProps) => (
  <div className="flex items-start">
    <svg className="w-5 h-5 text-primary mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
    <div>
      <p className="font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default WalletCreation;
