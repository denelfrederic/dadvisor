
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WalletCreation from "@/components/WalletCreation";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { getPortfolioById } from "@/utils/portfolios";
import { Home } from "lucide-react";

const Wallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isCreated, setIsCreated] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get portfolio ID from location state
  const portfolioId = location.state?.portfolioId;
  
  // Find the selected portfolio
  const portfolio = portfolioId 
    ? getPortfolioById(portfolioId) 
    : null;
  
  // Handle wallet creation
  const handleWalletCreated = (address: string) => {
    setWalletAddress(address);
    setIsCreated(true);
    
    // Show success toast
    toast({
      title: "Wallet créé avec succès",
      description: `Votre wallet a été créé à l'adresse ${address.substring(0, 8)}...${address.substring(address.length - 6)}`,
    });
  };
  
  // Handle continue to investment
  const handleContinue = () => {
    if (portfolio && walletAddress) {
      navigate("/investment", { 
        state: { 
          portfolioId, 
          walletAddress 
        } 
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-dadvisor-gray py-20 px-4">
      <div className="dadvisor-container">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-heading text-dadvisor-navy">Créer un Wallet Décentralisé</h1>
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link to="/">
              <Home size={18} />
              Accueil
            </Link>
          </Button>
        </div>
        
        <p className="text-dadvisor-darkgray text-center mb-10 max-w-2xl mx-auto">
          Un wallet décentralisé vous donne le contrôle total sur vos actifs numériques
        </p>
        
        <div className="mb-8">
          {portfolio && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white shadow-dadvisor p-6 rounded-xl mb-8"
            >
              <h2 className="text-xl font-medium mb-4 font-heading">Portefeuille sélectionné : {portfolio.name}</h2>
              <p className="text-dadvisor-darkgray mb-4">{portfolio.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Niveau de risque :</span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  portfolio.riskLevel === "Faible" ? "bg-green-100 text-green-800" :
                  portfolio.riskLevel === "Modéré" ? "bg-blue-100 text-blue-800" :
                  "bg-amber-100 text-amber-800"
                }`}>
                  {portfolio.riskLevel}
                </span>
              </div>
            </motion.div>
          )}
          
          <WalletCreation onWalletCreated={handleWalletCreated} />
        </div>
        
        {isCreated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <Button size="lg" onClick={handleContinue}>
              Continuer vers l'investissement
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
