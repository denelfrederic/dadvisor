
import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import InvestmentInput from "@/components/InvestmentInput";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { getPortfolioById } from "@/utils/portfolios";
import { Home } from "lucide-react";
import Navbar from "@/components/Navbar";

/**
 * Page Investment - Permet de finaliser l'investissement
 * Affiche un récapitulatif et permet à l'utilisateur de définir le montant à investir
 */
const Investment = () => {
  // États pour suivre le processus d'investissement
  const [isInvesting, setIsInvesting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Récupération de l'ID du portefeuille et de l'adresse du wallet depuis l'état de navigation
  const portfolioId = location.state?.portfolioId;
  const walletAddress = location.state?.walletAddress;
  
  // Recherche du portefeuille sélectionné dans les données
  const portfolio = portfolioId 
    ? getPortfolioById(portfolioId) 
    : null;
  
  /**
   * Gère la finalisation de l'investissement
   * @param amount - Montant à investir
   */
  const handleInvest = async (amount: number) => {
    if (!portfolio || !walletAddress) return;
    
    setIsInvesting(true);
    
    try {
      // Simulation d'un appel API pour traiter l'investissement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Affiche une notification de succès
      toast({
        title: "Investissement réussi !",
        description: `Vous avez investi ${amount.toLocaleString("fr-FR")} € dans le portefeuille ${portfolio.name}.`,
      });
      
      setIsComplete(true);
    } catch (error) {
      console.error("Error processing investment:", error);
      
      toast({
        variant: "destructive",
        title: "Erreur d'investissement",
        description: "Une erreur s'est produite lors du traitement de votre investissement. Veuillez réessayer.",
      });
    } finally {
      setIsInvesting(false);
    }
  };
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-radial py-20 px-4 pt-28">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Définir votre investissement</h1>
            <Button variant="outline" asChild className="flex items-center gap-2">
              <Link to="/">
                <Home size={18} />
                Accueil
              </Link>
            </Button>
          </div>
          
          <p className="text-muted-foreground text-center mb-10">
            Choisissez le montant que vous souhaitez investir dans votre portefeuille
          </p>
          
          {portfolio ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Récapitulatif de l'investissement */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="glass-card p-6 rounded-xl"
                >
                  <h2 className="text-xl font-medium mb-4">Récapitulatif</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Portefeuille</h3>
                      <p className="text-lg">{portfolio.name}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-1">Niveau de risque</h3>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        portfolio.riskLevel === "Faible" ? "bg-green-100 text-green-800" :
                        portfolio.riskLevel === "Modéré" ? "bg-blue-100 text-blue-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {portfolio.riskLevel}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-1">Rendement attendu</h3>
                      <p className="text-lg">{portfolio.expectedReturn}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-1">Wallet</h3>
                      <p className="text-sm font-mono">
                        {walletAddress ? `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 6)}` : "Non défini"}
                      </p>
                    </div>
                  </div>
                </motion.div>
                
                {/* Composant pour définir le montant d'investissement */}
                <InvestmentInput
                  portfolioName={portfolio.name}
                  expectedReturn={portfolio.expectedReturn}
                  minInvestment={100}
                  onInvest={handleInvest}
                />
              </div>
              
              {/* Message de confirmation après investissement réussi */}
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-green-50 border border-green-200 p-6 rounded-xl text-center"
                >
                  <svg className="w-12 h-12 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <h2 className="text-xl font-medium mb-2">Investissement réussi !</h2>
                  <p className="text-green-800 mb-6">
                    Félicitations ! Votre investissement a été traité avec succès.
                  </p>
                  <Button onClick={() => navigate("/")}>
                    Retour à l'accueil
                  </Button>
                </motion.div>
              )}
            </>
          ) : (
            // Message si aucun portefeuille n'est sélectionné
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Aucun portefeuille sélectionné. Veuillez recommencer le processus.
              </p>
              <Button onClick={() => navigate("/questionnaire")}>
                Refaire le questionnaire
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Investment;
