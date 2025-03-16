
import { PieChart } from "lucide-react";

interface ProfileHeaderProps {
  hasTempProfile: boolean;
}

const ProfileHeader = ({ hasTempProfile }: ProfileHeaderProps) => {
  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <PieChart className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Analyse de votre profil d'investisseur</h2>
      </div>
      
      {hasTempProfile && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg text-yellow-800">
          <p className="font-medium">Ce profil n'est pas encore sauvegardé dans votre compte.</p>
          <p>Cliquez sur "Sauvegarder mon profil" ci-dessous pour le conserver.</p>
        </div>
      )}
    </>
  );
};

export default ProfileHeader;
