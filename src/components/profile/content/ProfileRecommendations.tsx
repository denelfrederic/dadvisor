
import { motion } from "framer-motion";
import ProfileInvestments from "../ProfileInvestments";
import ProfileInsights from "../ProfileInsights";

interface ProfileRecommendationsProps {
  suitableInvestments: string[];
  risksToConsider: string[];
  investmentStyleInsights: string[];
}

const ProfileRecommendations = ({ 
  suitableInvestments, 
  risksToConsider, 
  investmentStyleInsights 
}: ProfileRecommendationsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <ProfileInvestments 
        suitableInvestments={suitableInvestments}
        risksToConsider={risksToConsider}
      />
      
      <ProfileInsights insights={investmentStyleInsights} />
    </motion.div>
  );
};

export default ProfileRecommendations;
