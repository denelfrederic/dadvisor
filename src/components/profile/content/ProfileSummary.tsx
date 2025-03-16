
import { motion } from "framer-motion";
import { InvestorProfileAnalysis } from "@/utils/questionnaire";
import ProfileRiskScore from "../ProfileRiskScore";
import ProfileTraits from "../ProfileTraits";

interface ProfileSummaryProps {
  analysis: InvestorProfileAnalysis;
  score: number;
}

const ProfileSummary = ({ analysis, score }: ProfileSummaryProps) => {
  return (
    <div className="flex-1">
      <h3 className="text-xl font-semibold text-primary mb-3">{analysis.title}</h3>
      <p className="text-muted-foreground mb-4">{analysis.description}</p>
      
      <ProfileRiskScore score={score} />
      <ProfileTraits traits={analysis.traits} />
    </div>
  );
};

export default ProfileSummary;
