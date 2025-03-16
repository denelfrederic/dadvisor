import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { PieChart, Home, RefreshCw, Wallet } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/use-auth-status";
import LoadingSpinner from "@/components/wallet/LoadingSpinner";
import { InvestorProfileAnalysis } from "@/utils/questionnaire";

interface ProfileData {
  score: number;
  profileType: string;
  analysis: InvestorProfileAnalysis;
  investmentStyleInsights: string[];
}

const ProfileAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuthStatus();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Accès refusé",
          description: "Vous devez être connecté pour accéder à cette page."
        });
        navigate("/auth");
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('investment_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          if (error.code === 'PGRST116') {
            toast({
              variant: "destructive",
              title: "Profil non trouvé",
              description: "Vous n'avez pas encore créé de profil d'investissement."
            });
            navigate("/questionnaire");
          } else {
            toast({
              variant: "destructive",
              title: "Erreur",
              description: "Impossible de charger votre profil d'investissement."
            });
          }
          return;
        }

        // Properly type and cast the JSON data
        const profileDataObj = data.profile_data as {
          analysis: InvestorProfileAnalysis;
          investmentStyleInsights: string[];
          answers: Record<string, { optionId: string; value: number }>;
        };

        setProfileData({
          score: data.score,
          profileType: data.profile_type,
          analysis: profileDataObj.analysis,
          investmentStyleInsights: profileDataObj.investmentStyleInsights
        });
      } catch (error) {
        console.error("Error in profile analysis:", error);
        toast({
          variant: "destructive", 
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement de votre profil."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, navigate]);

  const handleRetakeQuestionnaire = () => {
    navigate("/questionnaire");
  };

  return (
    <div className="min-h-screen bg-gradient-radial py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Votre profil d'investisseur</h1>
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link to="/">
              <Home size={18} />
              Accueil
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : profileData ? (
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
                    <h3 className="text-xl font-semibold text-primary mb-3">{profileData.analysis.title}</h3>
                    <p className="text-muted-foreground mb-4">{profileData.analysis.description}</p>
                    
                    <div className="mb-6">
                      <h4 className="font-medium mb-2">Score de tolérance au risque</h4>
                      <div className="bg-muted h-5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-1000"
                          style={{ width: `${profileData.score}%` }}
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
                        {profileData.analysis.traits.map((trait, index) => (
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
                          data={profileData.analysis.allocation}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {profileData.analysis.allocation.map((entry, index) => (
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
                    {profileData.analysis.suitableInvestments.map((investment, index) => (
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
                    {profileData.analysis.risksToConsider.map((risk, index) => (
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
                  {profileData.investmentStyleInsights.map((insight, index) => (
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
                    onClick={() => navigate("/wallet")}
                    className="flex items-center gap-2"
                  >
                    <Wallet size={16} />
                    Gérer vos wallets
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 text-center text-xs text-muted-foreground">
                <p>Rappel : DADVISOR vous aide à comprendre votre profil d'investisseur mais ne gère jamais vos fonds.</p>
                <p>Vous gardez à tout moment le contrôle total de vos investissements.</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="bg-card border shadow-sm rounded-xl p-6 text-center">
            <h3 className="text-xl font-medium mb-4">Aucun profil trouvé</h3>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas encore complété le questionnaire pour déterminer votre profil d'investisseur.
            </p>
            <Button onClick={() => navigate("/questionnaire")}>
              Compléter le questionnaire
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileAnalysis;
