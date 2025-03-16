
interface ProfileInvestmentsProps {
  suitableInvestments: string[];
  risksToConsider: string[];
}

const ProfileInvestments = ({ suitableInvestments, risksToConsider }: ProfileInvestmentsProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <div>
        <h4 className="font-medium mb-2">Investissements adaptés</h4>
        <ul className="space-y-1">
          {suitableInvestments.map((investment, index) => (
            <li key={index} className="text-sm flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>{investment}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Risques à considérer</h4>
        <ul className="space-y-1">
          {risksToConsider.map((risk, index) => (
            <li key={index} className="text-sm flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span>{risk}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfileInvestments;
