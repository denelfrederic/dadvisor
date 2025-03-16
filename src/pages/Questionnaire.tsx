import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { motion } from "framer-motion";
import { QuestionnaireProvider, useQuestionnaire } from "@/contexts/questionnaire";
import QuestionnaireProgress from "@/components/questionnaire/QuestionnaireProgress";
import QuestionnaireNavigation from "@/components/questionnaire/QuestionnaireNavigation";
import ProfileAnalysisDisplay from "@/components/questionnaire/ProfileAnalysisDisplay";

/**
 * Main content component for the questionnaire
 */
const QuestionnaireContent = () => {
  const { showAnalysis } = useQuestionnaire();

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
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link to="/">
              <Home size={18} />
              Accueil
            </Link>
          </Button>
        </div>
        
        <p className="text-muted-foreground text-center mb-10">
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
