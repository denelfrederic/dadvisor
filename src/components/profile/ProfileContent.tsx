
import { motion } from "framer-motion";
import { InvestorProfileAnalysis } from "@/utils/questionnaire";
import ProfileHeader from "./ProfileHeader";
import ProfileDetails from "./content/ProfileDetails";
import ProfileRecommendations from "./content/ProfileRecommendations";
import ProfileActions from "./ProfileActions";
import ProfileDisclaimer from "./ProfileDisclaimer";
import { NavigateFunction } from "react-router-dom";

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
  if (!profileData) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="bg-card border shadow-sm rounded-xl p-6 mb-10">
        <ProfileHeader hasTempProfile={hasTempProfile} />
        
        <ProfileDetails 
          analysis={profileData.analysis} 
          score={profileData.score} 
        />
        
        <ProfileRecommendations 
          suitableInvestments={profileData.analysis.suitableInvestments}
          risksToConsider={profileData.analysis.risksToConsider}
          investmentStyleInsights={profileData.investmentStyleInsights}
        />
        
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
