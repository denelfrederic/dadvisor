
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PortfolioDetailsDialog from "@/components/portfolio/PortfolioDetailsDialog";
import PortfolioPageHeader from "@/components/portfolio/PortfolioPageHeader";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";
import ContinueButton from "@/components/portfolio/ContinueButton";
import LoadingIndicator from "@/components/portfolio/LoadingIndicator";
import { usePortfolioSelection } from "@/hooks/portfolio/usePortfolioSelection";
import Navbar from "@/components/Navbar";
import BottomNavbar from "@/components/BottomNavbar";
import { QuestionnaireResponses } from "@/utils/questionnaire";
import { useAuthStatus } from "@/hooks/use-auth-status";

/**
 * Page Portfolios - Présente les différents portefeuilles d'investissement
 * Permet à l'utilisateur de sélectionner un portefeuille adapté à son profil
 */
const Portfolios = () => {
  const location = useLocation();
  const { user } = useAuthStatus();
  
  // Récupération du score de risque et des réponses depuis l'état de navigation ou utilisation de valeurs par défaut
  const riskScore = location.state?.score || 50;
  const questionnaireAnswers = location.state?.answers || 
    (localStorage.getItem('dadvisor_temp_answers') ? 
      JSON.parse(localStorage.getItem('dadvisor_temp_answers') || '{}') : {});
  
  // Utilisation du hook personnalisé pour gérer la sélection de portefeuille
  const {
    portfolios,
    loading,
    selectedPortfolioId,
    recommendedPortfolioId,
    detailsPortfolio,
    isDetailsOpen,
    handleSelectPortfolio,
    handleViewDetails,
    handleCloseDetails,
    handleProceed
  } = usePortfolioSelection(riskScore, questionnaireAnswers as QuestionnaireResponses);
  
  // Déterminer si le portefeuille recommandé est basé sur la préférence France/Europe
  // Ne montrer cette information que si l'utilisateur est connecté
  const isWarEconomy = user && recommendedPortfolioId === "wareconomy";
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 bg-gradient-radial py-20 px-4 pt-28">
        <div className="container mx-auto max-w-7xl">
          <PortfolioPageHeader isWarEconomy={!!isWarEconomy} />
          
          {loading ? (
            <LoadingIndicator />
          ) : (
            <>
              <PortfolioGrid
                portfolios={portfolios}
                recommendedPortfolioId={recommendedPortfolioId}
                selectedPortfolioId={selectedPortfolioId}
                onSelectPortfolio={handleSelectPortfolio}
                onViewDetails={handleViewDetails}
              />
              
              <ContinueButton 
                onClick={handleProceed} 
                disabled={!selectedPortfolioId}
              />
            </>
          )}
        </div>
      </div>
      
      <PortfolioDetailsDialog 
        portfolio={detailsPortfolio}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
      />
      
      <BottomNavbar />
    </div>
  );
};

export default Portfolios;
