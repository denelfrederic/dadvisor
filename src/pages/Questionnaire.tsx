
import { QuestionnaireProvider } from "@/contexts/questionnaire";
import Navbar from "@/components/Navbar";
import BottomNavbar from "@/components/BottomNavbar";
import QuestionnaireContainer from "@/components/questionnaire/QuestionnaireContainer";
import { useQuestionnairePageEffects } from "@/hooks/useQuestionnairePageEffects";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Page Questionnaire - Évalue le profil d'investisseur de l'utilisateur
 * Présente une série de questions pour déterminer la tolérance au risque
 */
const Questionnaire = () => {
  // Utiliser le hook d'effets pour gérer les effets de page
  useQuestionnairePageEffects();
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 bg-gradient-radial py-10 sm:py-20 px-3 sm:px-4 pt-28">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-8">Évaluation de votre profil</h1>
          
          <p className="text-muted-foreground text-center text-xs sm:text-sm mb-5 sm:mb-10 hidden md:block">
            Répondez honnêtement aux questions suivantes pour déterminer votre profil d'investissement.
          </p>
          
          <QuestionnaireContainer />
        </div>
      </div>
      <BottomNavbar />
    </div>
  );
};

export default Questionnaire;
