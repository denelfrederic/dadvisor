
import { motion } from "framer-motion";
import { InvestorProfileAnalysis } from "@/utils/questionnaire";
import ProfileHeader from "./ProfileHeader";
import ProfileDetails from "./content/ProfileDetails";
import ProfileRecommendations from "./content/ProfileRecommendations";
import ProfileActions from "./ProfileActions";
import ProfileDisclaimer from "./ProfileDisclaimer";
import { NavigateFunction } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileContentProps {
  profileData: {
    score: number;
    profileType: string;
    analysis: InvestorProfileAnalysis;
    investmentStyleInsights: string[];
  };
  hasTempProfile: boolean;
  handleRetakeQuestionnaire: () => void;
  handleSaveProfile: () => Promise<void>;
  navigate: NavigateFunction;
  isLoggedIn: boolean;
}

const ProfileContent = ({ 
  profileData, 
  hasTempProfile, 
  handleRetakeQuestionnaire,
  handleSaveProfile,
  navigate,
  isLoggedIn
}: ProfileContentProps) => {
  const isMobile = useIsMobile();
  
  if (!profileData) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="bg-card border shadow-sm rounded-xl p-4 sm:p-6 lg:p-8 mb-10 max-w-screen-2xl mx-auto">
        <ProfileHeader hasTempProfile={hasTempProfile} />
        
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <ProfileDetails 
              analysis={profileData.analysis} 
              score={profileData.score} 
            />
            
            <ProfileRecommendations 
              suitableInvestments={profileData.analysis.suitableInvestments}
              risksToConsider={profileData.analysis.risksToConsider}
              investmentStyleInsights={profileData.investmentStyleInsights}
            />
          </div>
          
          {!isMobile && (
            <div className="lg:col-span-4 bg-muted/20 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Résumé du profil</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Type de profil</h4>
                  <p className="text-primary font-medium">{profileData.analysis.title}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Score de risque</h4>
                  <p>{profileData.score}/100</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Principaux actifs recommandés</h4>
                  <ul className="space-y-1">
                    {profileData.analysis.allocation.slice(0, 3).map((item, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span>{item.label}</span>
                        <span className="font-medium">{item.value}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <ProfileActions 
          handleRetakeQuestionnaire={handleRetakeQuestionnaire}
          navigate={navigate}
          showSaveButton={hasTempProfile}
          handleSaveProfile={handleSaveProfile}
          isLoggedIn={isLoggedIn}
        />
        
        <ProfileDisclaimer />
      </div>
    </motion.div>
  );
};

export default ProfileContent;
