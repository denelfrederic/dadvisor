
import { Button } from "@/components/ui/button";
import { RefreshCw, Wallet, PieChart } from "lucide-react";
import { NavigateFunction } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileActionsProps {
  handleRetakeQuestionnaire: () => void;
  navigate: NavigateFunction;
  showSaveButton: boolean;
  handleSaveProfile: () => Promise<void>;
  isLoggedIn: boolean;
}

const ProfileActions = ({ 
  handleRetakeQuestionnaire, 
  navigate, 
  showSaveButton, 
  handleSaveProfile,
  isLoggedIn
}: ProfileActionsProps) => {
  const isMobile = useIsMobile();
  
  // Fonction de redémarrage avec navigation explicite
  const handleRestartQuestionnaire = () => {
    // D'abord exécute la logique de remise à zéro
    handleRetakeQuestionnaire();
    
    // Ensuite, navigation explicite avec timeout pour permettre le nettoyage
    setTimeout(() => {
      window.location.href = "/questionnaire";
    }, 100);
  };
  
  return (
    <div className="mt-12 mb-4">
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4'} gap-4`}>
        <Button 
          variant="outline" 
          onClick={handleRestartQuestionnaire}
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Recommencer le questionnaire
        </Button>
        
        {showSaveButton && isLoggedIn && (
          <Button 
            onClick={handleSaveProfile}
            className="flex items-center gap-2"
          >
            Sauvegarder mon profil
          </Button>
        )}
        
        <Button 
          onClick={() => navigate("/portfolios")}
          className="flex items-center gap-2"
          variant="outline"
        >
          <PieChart size={16} />
          Voir mon portefeuille adapté
        </Button>
        
        <Button 
          onClick={() => navigate("/wallet")}
          className="flex items-center gap-2"
        >
          <Wallet size={16} />
          Gérer mon coffre numérique
        </Button>
      </div>
    </div>
  );
};

export default ProfileActions;
