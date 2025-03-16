
import { motion } from "framer-motion";
import { InvestorProfileAnalysis } from "@/utils/questionnaire";
import ProfileSummary from "./ProfileSummary";
import ProfileChart from "../ProfileChart";

interface ProfileDetailsProps {
  analysis: InvestorProfileAnalysis;
  score: number;
}

const ProfileDetails = ({ analysis, score }: ProfileDetailsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex flex-col md:flex-row gap-8 items-start mb-8"
    >
      <ProfileSummary analysis={analysis} score={score} />
      <ProfileChart allocation={analysis.allocation} />
    </motion.div>
  );
};

export default ProfileDetails;
