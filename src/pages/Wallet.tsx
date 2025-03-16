
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WalletCreation from "@/components/WalletCreation";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { getPortfolioById } from "@/utils/portfolios";
import { Home } from "lucide-react";

/**
 * Page Wallet - Permet la création d'un wallet décentralisé
 * Affiche les informations du portefeuille sélectionné et permet de générer un wallet
 */
const Wallet = () => {
  // États pour suivre l'adresse du wallet et son statut de création
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isCreated, setIsCreated] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Récupération de l'ID du portefeuille depuis l'état de navigation
  const portfolioId = location.state?.portfolioId;
  
  // Recherche du portefeuille sélectionné dans les données
  const portfolio = portfolioId 
    ? getPortfolioById(portfolioId) 
    : null;
  
  /**
   * Gère la création réussie du wallet
   * @param address - Adresse du wallet créé
   */
  const handleWalletCreated = (address: string) => {
    setWalletAddress(address);
    setIsCreated(true);
    
    // Affiche une notification de succès
    toast({
      title: "Wallet créé avec succès",
      description: `Votre wallet a été créé à l'adresse ${address.substring(0, 8)}...${address.substring(address.length - 6)}`,
    });
  };
  
  /**
   * Gère la navigation vers la page d'investissement
   */
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
          {/* Affichage du portefeuille sélectionné, si disponible */}
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
          
          {/* Composant de création de wallet */}
          {!isCreated ? (
            <WalletCreation onWalletCreated={handleWalletCreated} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white shadow-dadvisor p-6 rounded-xl mb-8"
            >
              <h2 className="text-xl font-medium mb-4 font-heading">Wallet créé avec succès</h2>
              <p className="mb-4">Votre adresse : <span className="font-mono bg-gray-100 px-2 py-1 rounded">{walletAddress}</span></p>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  <div className="text-amber-800">
                    <p className="font-medium mb-1">Important</p>
                    <p className="text-xs">Votre wallet est désormais créé et vous seul en avez le contrôle. DADVISOR n'a aucun accès à vos fonds ni à vos clés privées.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Bouton pour continuer vers l'investissement une fois le wallet créé */}
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
