
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/use-auth-status";
import { InvestorProfileAnalysis, getInvestorProfileAnalysis, analyzeInvestmentStyle } from "@/utils/questionnaire";
import { TEMP_ANSWERS_KEY, TEMP_SCORE_KEY, TEMP_COMPLETE_KEY } from "@/contexts/questionnaire";
import ProfileContent from "@/components/profile/ProfileContent";
import ProfileEmptyState from "@/components/profile/ProfileEmptyState";
import ProfileLoading from "@/components/profile/ProfileLoading";

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

  // Function to check for temporary data
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
            // If no profile is found in the database, 
            // check if temporary data exists
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
    // Clean localStorage before restarting
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
      const profileDataForDb = {
        analysis: profileData.analysis,
        investmentStyleInsights: profileData.investmentStyleInsights,
        answers: answers
      };

      // Create data object for saving
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

      // Clean localStorage after successful save
      localStorage.removeItem(TEMP_ANSWERS_KEY);
      localStorage.removeItem(TEMP_SCORE_KEY);
      localStorage.removeItem(TEMP_COMPLETE_KEY);

      // Reload the page to display saved data
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

  const hasTempData = Boolean(localStorage.getItem(TEMP_ANSWERS_KEY));

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
          <ProfileLoading />
        ) : profileData ? (
          <ProfileContent 
            profileData={profileData}
            hasTempProfile={hasTempData}
            handleRetakeQuestionnaire={handleRetakeQuestionnaire}
            handleSaveProfile={handleSaveProfile}
            navigate={navigate}
            isLoggedIn={!!user}
          />
        ) : (
          <ProfileEmptyState navigate={navigate} />
        )}
      </div>
    </div>
  );
};

export default ProfileAnalysis;
