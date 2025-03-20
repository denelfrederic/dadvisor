
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { motion } from "framer-motion";
import { QuestionnaireProvider, useQuestionnaire } from "@/contexts/questionnaire";
import QuestionnaireProgress from "@/components/questionnaire/QuestionnaireProgress";
import QuestionnaireNavigation from "@/components/questionnaire/QuestionnaireNavigation";
import ProfileAnalysisDisplay from "@/components/questionnaire/ProfileAnalysisDisplay";
import QuestionnaireIntroduction from "@/components/questionnaire/QuestionnaireIntroduction";

/**
 * Main content component for the questionnaire
 */
const QuestionnaireContent = () => {
  const { showAnalysis, showIntroduction, setShowIntroduction } = useQuestionnaire();

  if (showIntroduction) {
    return <QuestionnaireIntroduction onStart={() => setShowIntroduction(false)} />;
  }

  return (
    <>
      {!showAnalysis ? (
        <>
          <QuestionnaireProgress />
          <QuestionnaireNavigation />
        </>
      ) : (
        <ProfileAnalysisDisplay />
      )}
    </>
  );
};

/**
 * Page Questionnaire - Évalue le profil d'investisseur de l'utilisateur
 * Présente une série de questions pour déterminer la tolérance au risque
 */
const Questionnaire = () => {
  return (
    <div className="min-h-screen bg-gradient-radial py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Évaluation de votre profil d'investisseur</h1>
          <Button variant="outline" asChild className="flex items-center justify-center w-10 h-10 p-0" aria-label="Retour à l'accueil">
            <Link to="/">
              <Home size={20} />
            </Link>
          </Button>
        </div>
        
        <p className="text-muted-foreground text-center mb-10 hidden md:block">
          Répondez honnêtement aux questions suivantes pour déterminer votre profil d'investissement.
        </p>
        
        <QuestionnaireProvider>
          <QuestionnaireContent />
        </QuestionnaireProvider>
      </div>
    </div>
  );
};

export default Questionnaire;
