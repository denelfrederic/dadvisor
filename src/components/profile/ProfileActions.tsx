
import { Button } from "@/components/ui/button";
import { RefreshCw, Wallet } from "lucide-react";
import { NavigateFunction } from "react-router-dom";

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
  return (
    <div className="flex justify-center mt-8">
      <div className="flex flex-col md:flex-row gap-4">
        <Button 
          variant="outline" 
          onClick={handleRetakeQuestionnaire}
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
          onClick={() => navigate("/wallet")}
          className="flex items-center gap-2"
        >
          <Wallet size={16} />
          Gérer vos coffres numériques
        </Button>
      </div>
    </div>
  );
};

export default ProfileActions;
