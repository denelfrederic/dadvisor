
interface ProfileRiskScoreProps {
  score: number;
}

const ProfileRiskScore = ({ score }: ProfileRiskScoreProps) => {
  return (
    <div className="mb-6">
      <h4 className="font-medium mb-2">Score de tolérance au risque</h4>
      <div className="bg-muted h-5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-1000"
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span>Conservateur</span>
        <span>Équilibré</span>
        <span>Croissance</span>
      </div>
    </div>
  );
};

export default ProfileRiskScore;
