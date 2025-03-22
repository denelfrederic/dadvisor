
import { motion } from "framer-motion";
import { InvestorProfileAnalysis } from "@/utils/questionnaire";
import ProfileSummary from "./ProfileSummary";
import ProfileChart from "../ProfileChart";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileDetailsProps {
  analysis: InvestorProfileAnalysis;
  score: number;
}

const ProfileDetails = ({ analysis, score }: ProfileDetailsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="mb-8"
    >
      <div className={`grid ${isMobile ? 'grid-cols-1' : 'xl:grid-cols-5'} gap-8`}>
        <div className="xl:col-span-3">
          <ProfileSummary analysis={analysis} score={score} />
        </div>
        <div className="xl:col-span-2">
          <ProfileChart allocation={analysis.allocation} />
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileDetails;
