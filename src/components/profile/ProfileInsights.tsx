
interface ProfileInsightsProps {
  insights: string[];
}

const ProfileInsights = ({ insights }: ProfileInsightsProps) => {
  return (
    <div className="bg-muted/30 p-4 rounded-lg mb-8">
      <h4 className="font-medium mb-2">Insights personnalisés sur votre style d'investissement</h4>
      <ul className="space-y-3">
        {insights.map((insight, index) => (
          <li key={index} className="text-sm">
            {insight}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileInsights;
