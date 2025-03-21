
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PortfolioCard, { Portfolio } from "@/components/PortfolioCard";
import PortfolioDetailsDialog from "@/components/portfolio/PortfolioDetailsDialog";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { getPortfolios, getRecommendedPortfolio } from "@/utils/portfolios";
import { Home } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNavbar from "@/components/BottomNavbar";

/**
 * Page Portfolios - Présente les différents portefeuilles d'investissement
 * Permet à l'utilisateur de sélectionner un portefeuille adapté à son profil
 */
const Portfolios = () => {
  // États pour gérer les portefeuilles et la sélection
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendedPortfolioId, setRecommendedPortfolioId] = useState<string | null>(null);
  
  // État pour la boîte de dialogue des détails
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsPortfolio, setDetailsPortfolio] = useState<Portfolio | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Récupération du score de risque depuis l'état de navigation ou utilisation d'une valeur par défaut
  const riskScore = location.state?.score || 50;
  
  // Chargement des portefeuilles et détermination du portefeuille recommandé
  useEffect(() => {
    const fetchPortfolios = async () => {
      setLoading(true);
      try {
        // Récupération des portefeuilles depuis la fonction utilitaire
        const portfolioData = getPortfolios();
        setPortfolios(portfolioData);
        
        // Détermination du portefeuille recommandé en fonction du score de risque
        const recommendedId = getRecommendedPortfolio(riskScore);
        setRecommendedPortfolioId(recommendedId);
        setSelectedPortfolioId(recommendedId);
      } catch (error) {
        console.error("Error fetching portfolios:", error);
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger les portefeuilles. Veuillez réessayer."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPortfolios();
  }, [riskScore]);
  
  /**
   * Gère la sélection d'un portefeuille par l'utilisateur
   * @param portfolioId - ID du portefeuille sélectionné
   */
  const handleSelectPortfolio = (portfolioId: string) => {
    setSelectedPortfolioId(portfolioId);
    
    // Affiche une notification de confirmation
    const selectedPortfolio = portfolios.find(p => p.id === portfolioId);
    if (selectedPortfolio) {
      toast({
        title: "Portefeuille sélectionné",
        description: `Vous avez choisi le portefeuille ${selectedPortfolio.name}`
      });
    }
  };
  
  /**
   * Gère l'ouverture de la boîte de dialogue des détails
   * @param portfolioId - ID du portefeuille à afficher en détail
   */
  const handleViewDetails = (portfolioId: string) => {
    const portfolio = portfolios.find(p => p.id === portfolioId);
    if (portfolio) {
      setDetailsPortfolio(portfolio);
      setIsDetailsOpen(true);
    }
  };
  
  /**
   * Gère la fermeture de la boîte de dialogue des détails
   */
  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };
  
  /**
   * Gère la validation et le passage à l'étape suivante
   */
  const handleProceed = () => {
    if (selectedPortfolioId) {
      // Vérifie si l'utilisateur a sélectionné un portefeuille plus risqué que celui recommandé
      const selectedPortfolio = portfolios.find(p => p.id === selectedPortfolioId);
      const recommendedPortfolio = portfolios.find(p => p.id === recommendedPortfolioId);
      
      if (selectedPortfolio && recommendedPortfolio) {
        const isRiskier = 
          (recommendedPortfolio.riskLevel === "Faible" && ["Modéré", "Élevé"].includes(selectedPortfolio.riskLevel)) ||
          (recommendedPortfolio.riskLevel === "Modéré" && selectedPortfolio.riskLevel === "Élevé");
        
        if (isRiskier) {
          // Alerte l'utilisateur qu'il a sélectionné un portefeuille plus risqué que celui recommandé
          toast({
            variant: "destructive",
            title: "Attention",
            description: "Vous avez sélectionné un portefeuille plus risqué que celui recommandé pour votre profil.",
            action: (
              <Button 
                variant="outline" 
                onClick={() => navigate("/wallet", { state: { portfolioId: selectedPortfolioId } })}
              >
                Continuer quand même
              </Button>
            )
          });
        } else {
          // Poursuit vers la création du wallet
          navigate("/wallet", { state: { portfolioId: selectedPortfolioId } });
        }
      }
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 bg-gradient-radial py-20 px-4 pt-28">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold mb-8">Choisissez votre portefeuille</h1>
          
          <p className="text-muted-foreground text-center mb-10">
            Basé sur votre profil de risque, nous vous recommandons un portefeuille adapté.
            Vous pouvez toutefois sélectionner celui qui vous convient le mieux.
          </p>
          
          {loading ? (
            // Affichage du chargement
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Grille des portefeuilles disponibles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {portfolios.map((portfolio) => (
                  <PortfolioCard
                    key={portfolio.id}
                    portfolio={portfolio}
                    isRecommended={portfolio.id === recommendedPortfolioId}
                    onSelect={handleSelectPortfolio}
                    isSelected={selectedPortfolioId === portfolio.id}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
              
              {/* Bouton pour continuer avec le portefeuille sélectionné */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center"
              >
                <Button 
                  size="lg" 
                  onClick={handleProceed} 
                  disabled={!selectedPortfolioId}
                >
                  Continuer avec ce portefeuille
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </div>
      
      {/* Boîte de dialogue des détails du portefeuille */}
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
