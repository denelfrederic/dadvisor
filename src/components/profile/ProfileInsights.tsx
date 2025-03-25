
interface ProfileInsightsProps {
  insights: string[];
}

const ProfileInsights = ({ insights }: ProfileInsightsProps) => {
  return (
    <div className="bg-muted/30 p-5 rounded-lg mb-8 shadow-sm border border-muted/50">
      <h4 className="font-medium mb-4 text-primary">Insights personnalisés sur votre style d'investissement</h4>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
        {insights.map((insight, index) => (
          <div key={index} className="bg-white/70 p-3 rounded-md shadow-sm">
            <p className="text-sm">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileInsights;
