
import { QuestionnaireProvider, useQuestionnaire } from "@/contexts/questionnaire";
import QuestionnaireProgress from "@/components/questionnaire/QuestionnaireProgress";
import QuestionnaireNavigation from "@/components/questionnaire/QuestionnaireNavigation";
import ProfileAnalysisDisplay from "@/components/questionnaire/ProfileAnalysisDisplay";
import QuestionnaireIntroduction from "@/components/questionnaire/QuestionnaireIntroduction";
import Navbar from "@/components/Navbar";
import BottomNavbar from "@/components/BottomNavbar";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Main content component for the questionnaire
 */
const QuestionnaireContent = () => {
  const { showAnalysis, showIntroduction, setShowIntroduction } = useQuestionnaire();
  const [forceRender, setForceRender] = useState(false);

  // Fonction pour démarrer le questionnaire avec gestion d'erreur
  const handleStartQuestionnaire = () => {
    try {
      console.log("Démarrage du questionnaire depuis QuestionnaireContent");
      
      // Utiliser le toast pour une notification visible
      toast.success("Questionnaire démarré");
      
      // Forcer un rendu et un changement d'état
      localStorage.setItem('questionnaire_started', 'true');
      
      // Définir explicitement à false avec callback pour garantir l'exécution
      setShowIntroduction(false);
      console.log("showIntroduction défini à false");
      
      // Forcer un nouveau rendu après l'état mis à jour
      setTimeout(() => {
        setForceRender(prev => !prev);
      }, 50);
    } catch (error) {
      console.error("Erreur lors du démarrage:", error);
      toast.error("Une erreur est survenue. Veuillez rafraîchir la page.");
    }
  };

  // Log d'état pour le débogage
  useEffect(() => {
    console.log("État actuel - showIntroduction:", showIntroduction, "showAnalysis:", showAnalysis, "forceRender:", forceRender);
    
    // Vérifier si nous devons forcer l'affichage du questionnaire
    const hasStarted = localStorage.getItem('questionnaire_started') === 'true';
    if (hasStarted && showIntroduction) {
      console.log("Force l'affichage du questionnaire via localStorage");
      setShowIntroduction(false);
    }
  }, [showIntroduction, showAnalysis, forceRender, setShowIntroduction]);

  // Rendu conditionnel basé sur l'état et forceRender
  if (showIntroduction && localStorage.getItem('questionnaire_started') !== 'true') {
    console.log("Affichage de l'introduction");
    return (
      <motion.div
        key="introduction"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <QuestionnaireIntroduction onStart={handleStartQuestionnaire} />
      </motion.div>
    );
  }

  // Si l'introduction n'est pas affichée, montrer le questionnaire ou l'analyse
  console.log("Affichage du questionnaire ou de l'analyse");
  return (
    <motion.div
      key="questionnaire-content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {!showAnalysis ? (
        <>
          <QuestionnaireProgress />
          <QuestionnaireNavigation />
        </>
      ) : (
        <ProfileAnalysisDisplay />
      )}
    </motion.div>
  );
};

/**
 * Page Questionnaire - Évalue le profil d'investisseur de l'utilisateur
 * Présente une série de questions pour déterminer la tolérance au risque
 */
const Questionnaire = () => {
  // Réinitialiser l'état du démarrage si on vient de recharger la page
  useEffect(() => {
    const cleanup = () => {
      // Effacer seulement si on est sur la page questionnaire pour éviter les conflits
      if (window.location.pathname.includes('questionnaire')) {
        localStorage.removeItem('questionnaire_started');
        console.log("État du questionnaire réinitialisé");
      }
    };
    
    // Nettoyer à la fois au montage (page reload) et au démontage (navigation)
    cleanup();
    return cleanup;
  }, []);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 bg-gradient-radial py-10 sm:py-20 px-3 sm:px-4 pt-28">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-8">Évaluation de votre profil</h1>
          
          <p className="text-muted-foreground text-center text-xs sm:text-sm mb-5 sm:mb-10 hidden md:block">
            Répondez honnêtement aux questions suivantes pour déterminer votre profil d'investissement.
          </p>
          
          <QuestionnaireContent />
        </div>
      </div>
      <BottomNavbar />
    </div>
  );
};

export default Questionnaire;
