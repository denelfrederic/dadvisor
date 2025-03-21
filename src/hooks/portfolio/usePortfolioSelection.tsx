import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Portfolio } from "@/components/PortfolioCard";
import { getPortfolios, getRecommendedPortfolio, isPortfolioMoreRisky } from "@/utils/portfolios";
import { QuestionnaireResponses } from "@/utils/questionnaire";
import { Button } from "@/components/ui/button";

/**
 * Interface pour le retour du hook usePortfolioSelection
 */
interface UsePortfolioSelectionReturn {
  portfolios: Portfolio[];
  loading: boolean;
  selectedPortfolioId: string | null;
  recommendedPortfolioId: string | null;
  detailsPortfolio: Portfolio | null;
  isDetailsOpen: boolean;
  handleSelectPortfolio: (portfolioId: string) => void;
  handleViewDetails: (portfolioId: string) => void;
  handleCloseDetails: () => void;
  handleProceed: () => void;
}

/**
 * Hook personnalisé pour gérer la sélection de portefeuille
 */
export const usePortfolioSelection = (
  riskScore: number,
  questionnaireAnswers: QuestionnaireResponses
): UsePortfolioSelectionReturn => {
  // États pour gérer les portefeuilles et la sélection
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendedPortfolioId, setRecommendedPortfolioId] = useState<string | null>(null);
  
  // État pour la boîte de dialogue des détails
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsPortfolio, setDetailsPortfolio] = useState<Portfolio | null>(null);
  
  const navigate = useNavigate();
  
  // Afficher les données reçues pour le débogage
  useEffect(() => {
    console.log("Portfolios: Données reçues du questionnaire:", {
      riskScore,
      answers: questionnaireAnswers
    });
    
    // Vérifier spécifiquement la réponse à la question sur la souveraineté
    if (questionnaireAnswers.sovereignty) {
      console.log("Réponse à la question souveraineté:", questionnaireAnswers.sovereignty);
      
      // Vérifier si des mots-clés sont présents dans le texte
      if (questionnaireAnswers.sovereignty.text) {
        const text = questionnaireAnswers.sovereignty.text.toLowerCase();
        console.log("Texte de la réponse sur souveraineté:", text);
        console.log("Contient 'france':", text.includes("france"));
        console.log("Contient 'europe':", text.includes("europe"));
      }
    }
  }, [riskScore, questionnaireAnswers]);
  
  // Chargement des portefeuilles et détermination du portefeuille recommandé
  useEffect(() => {
    const fetchPortfolios = async () => {
      setLoading(true);
      try {
        // Récupération des portefeuilles depuis la fonction utilitaire
        const portfolioData = getPortfolios();
        setPortfolios(portfolioData);
        
        // Détermination du portefeuille recommandé en fonction du score de risque et des réponses au questionnaire
        const recommendedId = getRecommendedPortfolio(riskScore, questionnaireAnswers);
        console.log("Portefeuille recommandé:", recommendedId, "Score:", riskScore);
        
        setRecommendedPortfolioId(recommendedId);
        setSelectedPortfolioId(recommendedId);
        
        // Afficher une notification pour le portefeuille recommandé
        const recommendedPortfolio = portfolioData.find(p => p.id === recommendedId);
        if (recommendedPortfolio) {
          const isWarEconomy = recommendedId === "wareconomy";
          
          toast({
            title: "Recommandation",
            description: isWarEconomy 
              ? `Basé sur votre préférence pour les investissements en France/Europe, nous vous recommandons le portefeuille ${recommendedPortfolio.name}`
              : `Basé sur votre profil de risque (${riskScore}), nous vous recommandons le portefeuille ${recommendedPortfolio.name}`
          });
        }
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
  }, [riskScore, questionnaireAnswers]);
  
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
      if (recommendedPortfolioId) {
        const isRiskier = isPortfolioMoreRisky(selectedPortfolioId, recommendedPortfolioId);
        
        if (isRiskier) {
          // Alerte l'utilisateur qu'il a sélectionné un portefeuille plus risqué que celui recommandé
          const handleContinueAnyway = () => {
            navigate("/wallet", { state: { portfolioId: selectedPortfolioId } });
          };
          
          toast({
            variant: "destructive",
            title: "Attention",
            description: "Vous avez sélectionné un portefeuille plus risqué que celui recommandé pour votre profil.",
            action: <Button variant="outline" onClick={handleContinueAnyway}>Continuer quand même</Button>
          });
        } else {
          // Poursuit vers la création du wallet
          navigate("/wallet", { state: { portfolioId: selectedPortfolioId } });
        }
      } else {
        // Poursuit vers la création du wallet si aucun portefeuille recommandé
        navigate("/wallet", { state: { portfolioId: selectedPortfolioId } });
      }
    }
  };

  return {
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
  };
};
