
import { motion } from "framer-motion";
import { InvestorProfileAnalysis } from "@/utils/questionnaire";
import ProfileHeader from "./ProfileHeader";
import ProfileRiskScore from "./ProfileRiskScore";
import ProfileTraits from "./ProfileTraits";
import ProfileChart from "./ProfileChart";
import ProfileInvestments from "./ProfileInvestments";
import ProfileInsights from "./ProfileInsights";
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
        
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-primary mb-3">{profileData.analysis.title}</h3>
              <p className="text-muted-foreground mb-4">{profileData.analysis.description}</p>
              
              <ProfileRiskScore score={profileData.score} />
              <ProfileTraits traits={profileData.analysis.traits} />
            </div>
            
            <ProfileChart allocation={profileData.analysis.allocation} />
          </div>
        </div>
        
        <ProfileInvestments 
          suitableInvestments={profileData.analysis.suitableInvestments}
          risksToConsider={profileData.analysis.risksToConsider}
        />
        
        <ProfileInsights insights={profileData.investmentStyleInsights} />
        
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
