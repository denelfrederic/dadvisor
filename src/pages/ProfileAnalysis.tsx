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
import { InvestorProfileAnalysis, getInvestorProfileAnalysis, analyzeInvestmentStyle, calculateRiskScore } from "@/utils/questionnaire";
import { Json } from "@/integrations/supabase/types";

// Clés pour le localStorage
const TEMP_ANSWERS_KEY = "dadvisor_temp_answers";
const TEMP_SCORE_KEY = "dadvisor_temp_score";
const TEMP_COMPLETE_KEY = "dadvisor_temp_complete";

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

  // Fonction pour vérifier si des données temporaires existent
  const checkForTemporaryData = () => {
    const savedAnswers = localStorage.getItem(TEMP_ANSWERS_KEY);
    const savedScore = localStorage.getItem(TEMP_SCORE_KEY);
    const savedComplete = localStorage.getItem(TEMP_COMPLETE_KEY);
    
    if (savedAnswers && savedScore && savedComplete) {
      try {
        const answers = JSON.parse(savedAnswers);
        const score = JSON.parse(savedScore);
        const isComplete = JSON.parse(savedComplete);
        
        if (isComplete && Object.keys(answers).length > 0) {
          const analysis = getInvestorProfileAnalysis(score, answers);
          const insights = analyzeInvestmentStyle(answers);
          
          let profileType = "balanced";
          if (score < 40) profileType = "conservative";
          else if (score >= 70) profileType = "growth";
          
          setProfileData({
            score,
            profileType,
            analysis,
            investmentStyleInsights: insights
          });
          
          toast({
            title: "Profil temporaire chargé",
            description: "Votre profil n'est pas encore sauvegardé. Vous pouvez le faire depuis cette page."
          });
          
          return true;
        }
      } catch (e) {
        console.error("Error parsing temp data:", e);
      }
    }
    return false;
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        if (checkForTemporaryData()) {
          setLoading(false);
          return;
        }
        
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
            // Si aucun profil n'est trouvé dans la base de données, 
            // vérifier si des données temporaires existent
            if (checkForTemporaryData()) {
              setLoading(false);
              return;
            }
            
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

        // Use a type assertion to handle the JSON data
        const profileDataObj = data.profile_data as unknown as {
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
    // Nettoyer le localStorage avant de recommencer
    localStorage.removeItem(TEMP_ANSWERS_KEY);
    localStorage.removeItem(TEMP_SCORE_KEY);
    localStorage.removeItem(TEMP_COMPLETE_KEY);
    navigate("/questionnaire");
  };

  const handleSaveProfile = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Connexion requise",
        description: "Vous devez être connecté pour sauvegarder votre profil."
      });
      navigate("/auth");
      return;
    }

    if (!profileData) return;

    try {
      const savedAnswers = localStorage.getItem(TEMP_ANSWERS_KEY);
      if (!savedAnswers) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Données du questionnaire non trouvées."
        });
        return;
      }

      const answers = JSON.parse(savedAnswers);
      
      // Prepare data for Supabase (with correct typing)
      const profileDataForDb: Json = {
        analysis: profileData.analysis as unknown as Json,
        investmentStyleInsights: profileData.investmentStyleInsights as unknown as Json,
        answers: answers as unknown as Json
      };

      // Crée l'objet de données pour la sauvegarde
      const profileDataToSave = {
        user_id: user.id,
        score: Math.round(profileData.score),
        profile_type: profileData.profileType,
        profile_data: profileDataForDb
      };

      const { error } = await supabase
        .from('investment_profiles')
        .insert(profileDataToSave);

      if (error) throw error;

      toast({
        title: "Profil sauvegardé",
        description: "Votre profil d'investisseur a été sauvegardé avec succès."
      });

      // Nettoyer le localStorage après sauvegarde réussie
      localStorage.removeItem(TEMP_ANSWERS_KEY);
      localStorage.removeItem(TEMP_SCORE_KEY);
      localStorage.removeItem(TEMP_COMPLETE_KEY);

      // Recharger la page pour afficher les données sauvegardées
      window.location.reload();
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Erreur de sauvegarde",
        description: error.message || "Une erreur est survenue lors de la sauvegarde de votre profil."
      });
    }
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
              
              {/* Afficher un message si le profil est temporaire */}
              {localStorage.getItem(TEMP_ANSWERS_KEY) && (
                <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg text-yellow-800">
                  <p className="font-medium">Ce profil n'est pas encore sauvegardé dans votre compte.</p>
                  <p>Cliquez sur "Sauvegarder mon profil" ci-dessous pour le conserver.</p>
                </div>
              )}
              
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
                  
                  {/* Afficher le bouton de sauvegarde seulement si des données temporaires existent */}
                  {localStorage.getItem(TEMP_ANSWERS_KEY) && user && (
                    <Button 
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2"
                    >
                      Sauvegarder mon profil
                    </Button>
                  )}
                  
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
