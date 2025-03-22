
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileInvestmentsProps {
  suitableInvestments: string[];
  risksToConsider: string[];
}

const ProfileInvestments = ({ suitableInvestments, risksToConsider }: ProfileInvestmentsProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <div className="bg-card rounded-lg p-4 shadow-sm">
        <h4 className="font-medium mb-3 text-primary">Investissements adaptés</h4>
        <ul className="space-y-2">
          {suitableInvestments.map((investment, index) => (
            <li key={index} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-sm">{investment}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-card rounded-lg p-4 shadow-sm">
        <h4 className="font-medium mb-3 text-primary">Risques à considérer</h4>
        <ul className="space-y-2">
          {risksToConsider.map((risk, index) => (
            <li key={index} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
              <span className="text-sm">{risk}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfileInvestments;
