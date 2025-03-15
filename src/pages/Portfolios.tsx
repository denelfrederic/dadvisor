
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PortfolioCard, { Portfolio } from "@/components/PortfolioCard";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { getPortfolios, getRecommendedPortfolio } from "@/utils/portfolios";
import { Home } from "lucide-react";

const Portfolios = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendedPortfolioId, setRecommendedPortfolioId] = useState<string | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get risk score from location state or use a default value
  const riskScore = location.state?.score || 50;
  
  // Load portfolios and determine recommended portfolio
  useEffect(() => {
    const fetchPortfolios = async () => {
      setLoading(true);
      try {
        // Get portfolios from utility function
        const portfolioData = getPortfolios();
        setPortfolios(portfolioData);
        
        // Determine recommended portfolio based on risk score
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
  
  // Function to handle portfolio selection
  const handleSelectPortfolio = (portfolioId: string) => {
    setSelectedPortfolioId(portfolioId);
    
    // Show confirmation toast
    const selectedPortfolio = portfolios.find(p => p.id === portfolioId);
    if (selectedPortfolio) {
      toast({
        title: "Portefeuille sélectionné",
        description: `Vous avez choisi le portefeuille ${selectedPortfolio.name}`
      });
    }
  };
  
  // Function to proceed to wallet creation
  const handleProceed = () => {
    if (selectedPortfolioId) {
      // Check if user selected a riskier portfolio than recommended
      const selectedPortfolio = portfolios.find(p => p.id === selectedPortfolioId);
      const recommendedPortfolio = portfolios.find(p => p.id === recommendedPortfolioId);
      
      if (selectedPortfolio && recommendedPortfolio) {
        const isRiskier = 
          (recommendedPortfolio.riskLevel === "Faible" && ["Modéré", "Élevé"].includes(selectedPortfolio.riskLevel)) ||
          (recommendedPortfolio.riskLevel === "Modéré" && selectedPortfolio.riskLevel === "Élevé");
        
        if (isRiskier) {
          // Alert user that they selected a riskier portfolio than recommended
          toast({
            variant: "destructive",  // Changed from "warning" to "destructive"
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
          // Proceed to wallet creation
          navigate("/wallet", { state: { portfolioId: selectedPortfolioId } });
        }
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-radial py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Choisissez votre portefeuille</h1>
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link to="/">
              <Home size={18} />
              Accueil
            </Link>
          </Button>
        </div>
        
        <p className="text-muted-foreground text-center mb-10">
          Basé sur votre profil de risque, nous vous recommandons un portefeuille adapté.
          Vous pouvez toutefois sélectionner celui qui vous convient le mieux.
        </p>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {portfolios.map((portfolio) => (
                <PortfolioCard
                  key={portfolio.id}
                  portfolio={portfolio}
                  isRecommended={portfolio.id === recommendedPortfolioId}
                  onSelect={handleSelectPortfolio}
                  isSelected={selectedPortfolioId === portfolio.id}
                />
              ))}
            </div>
            
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
  );
};

export default Portfolios;
