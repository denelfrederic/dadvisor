
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WalletCreation from "@/components/WalletCreation";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { getPortfolioById } from "@/utils/portfolios";
import Navbar from "@/components/Navbar";

/**
 * Page Coffre numérique - Permet la création d'un coffre numérique décentralisé
 * Affiche les informations du portefeuille sélectionné et permet de générer un coffre numérique
 */
const Wallet = () => {
  // États pour suivre l'adresse du coffre numérique et son statut de création
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
   * Gère la création réussie du coffre numérique
   * @param address - Adresse du coffre numérique créé
   */
  const handleWalletCreated = (address: string) => {
    setWalletAddress(address);
    setIsCreated(true);
    
    // Affiche une notification de succès
    toast({
      title: "Coffre numérique créé avec succès",
      description: `Votre coffre numérique a été créé à l'adresse ${address.substring(0, 8)}...${address.substring(address.length - 6)}`,
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
    <>
      <Navbar />
      <div className="min-h-screen bg-dadvisor-gray py-20 px-4 pt-28">
        <div className="dadvisor-container">
          <h1 className="text-3xl font-bold font-heading text-dadvisor-navy mb-8">Coffre numérique</h1>
          
          <p className="text-dadvisor-darkgray text-center mb-10 max-w-2xl mx-auto">
            Un coffre numérique décentralisé vous donne le contrôle total sur vos actifs numériques, vos clés sont cryptées et sécurisées par biométrie.
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
            
            {/* Composant de création de coffre numérique */}
            {!isCreated ? (
              <WalletCreation onWalletCreated={handleWalletCreated} />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white shadow-dadvisor p-6 rounded-xl mb-8"
              >
                <h2 className="text-xl font-medium mb-4 font-heading">Coffre numérique créé avec succès</h2>
                <p className="mb-4">Votre adresse : <span className="font-mono bg-gray-100 px-2 py-1 rounded">{walletAddress}</span></p>
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <div className="text-amber-800">
                      <p className="font-medium mb-1">Important</p>
                      <p className="text-xs">Votre coffre numérique est désormais créé et vous seul en avez le contrôle. DADVISOR n'a aucun accès à vos fonds ni à vos clés privées, qui sont cryptées et sécurisées par biométrie.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Bouton pour continuer vers l'investissement une fois le coffre numérique créé */}
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
    </>
  );
};

export default Wallet;
