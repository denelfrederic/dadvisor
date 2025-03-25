
interface ProfileInsightsProps {
  insights: string[];
}

const ProfileInsights = ({ insights }: ProfileInsightsProps) => {
  return (
    <div className="bg-dadvisor-lightblue/50 p-5 rounded-lg mb-8 shadow-dadvisor border border-dadvisor-lightblue">
      <h4 className="font-montserrat font-medium mb-4 text-dadvisor-navy">Insights personnalisés sur votre style d'investissement</h4>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
        {insights.map((insight, index) => (
          <div key={index} className="bg-white p-3 rounded-md shadow-sm border border-gray-50">
            <p className="text-sm font-montserrat">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileInsights;
