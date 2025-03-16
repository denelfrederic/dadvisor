
import { Button } from "@/components/ui/button";
import { NavigateFunction } from "react-router-dom";

interface ProfileEmptyStateProps {
  navigate: NavigateFunction;
}

const ProfileEmptyState = ({ navigate }: ProfileEmptyStateProps) => {
  return (
    <div className="bg-card border shadow-sm rounded-xl p-6 text-center">
      <h3 className="text-xl font-medium mb-4">Aucun profil trouvé</h3>
      <p className="text-muted-foreground mb-6">
        Vous n'avez pas encore complété le questionnaire pour déterminer votre profil d'investisseur.
      </p>
      <Button onClick={() => navigate("/questionnaire")}>
        Compléter le questionnaire
      </Button>
    </div>
  );
};

export default ProfileEmptyState;
