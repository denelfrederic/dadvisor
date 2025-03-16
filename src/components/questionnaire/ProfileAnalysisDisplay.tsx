
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PieChart, RefreshCw, ArrowRight } from "lucide-react";
import { useQuestionnaire } from "@/contexts/questionnaire";
import { ChartContainer } from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip } from "recharts";

const ProfileAnalysisDisplay = () => {
  const { 
    score, 
    profileAnalysis, 
    investmentStyleInsights, 
    handleRetakeQuestionnaire, 
    handleContinueToPortfolios, 
    saveInvestmentProfile, 
    saving 
  } = useQuestionnaire();

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (!profileAnalysis) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="bg-card border shadow-sm rounded-xl p-6 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <PieChart className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Analyse de votre profil d'investisseur</h2>
        </div>
        
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-primary mb-3">{profileAnalysis.title}</h3>
              <p className="text-muted-foreground mb-4">{profileAnalysis.description}</p>
              
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
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Caractéristiques de votre profil</h4>
                <ul className="space-y-2">
                  {profileAnalysis.traits.map((trait, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center mt-0.5">
                        •
                      </div>
                      <span>{trait}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="w-full md:w-64 h-64">
              <h4 className="font-medium mb-2 text-center">Allocation recommandée</h4>
              <ChartContainer config={{}} className="h-56">
                <RechartsPieChart>
                  <Pie
                    data={profileAnalysis.allocation}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {profileAnalysis.allocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ChartContainer>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="font-medium mb-2">Investissements adaptés</h4>
            <ul className="space-y-1">
              {profileAnalysis.suitableInvestments.map((investment, index) => (
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
              {profileAnalysis.risksToConsider.map((risk, index) => (
                <li key={index} className="text-sm flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="bg-muted/30 p-4 rounded-lg mb-8">
          <h4 className="font-medium mb-2">Insights personnalisés sur votre style d'investissement</h4>
          <ul className="space-y-3">
            {investmentStyleInsights.map((insight, index) => (
              <li key={index} className="text-sm">
                {insight}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex justify-center mt-8">
          <div className="flex flex-col md:flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={handleRetakeQuestionnaire}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Recommencer le questionnaire
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleContinueToPortfolios}
              className="flex items-center gap-2"
            >
              Découvrir les portefeuilles recommandés
              <ArrowRight size={16} />
            </Button>

            <Button 
              onClick={saveInvestmentProfile}
              className="flex items-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="mr-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Enregistrement en cours...
                </>
              ) : (
                "Enregistrer mon profil d'investisseur"
              )}
            </Button>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Rappel : DADVISOR vous aide à comprendre votre profil d'investisseur mais ne gère jamais vos fonds.</p>
          <p>Vous gardez à tout moment le contrôle total de vos investissements.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileAnalysisDisplay;
