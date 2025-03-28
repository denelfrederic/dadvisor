
import { motion } from "framer-motion";
import { useEffect } from "react";
import QuestionnaireProgress from "@/components/questionnaire/QuestionnaireProgress";
import QuestionnaireNavigation from "@/components/questionnaire/QuestionnaireNavigation";
import QuestionnaireIntroduction from "@/components/questionnaire/QuestionnaireIntroduction";
import ProfileAnalysisDisplay from "@/components/questionnaire/ProfileAnalysisDisplay";
import { useQuestionnaire } from "@/contexts/questionnaire";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

/**
 * Hook personnalisé pour gérer le démarrage du questionnaire
 * Centralise la logique de démarrage et de vérification d'état
 */
const useQuestionnaireStarter = () => {
  const { showIntroduction, setShowIntroduction } = useQuestionnaire();
  const location = useLocation();

  // Fonction pour démarrer le questionnaire avec gestion d'erreur et logging
  const handleStartQuestionnaire = () => {
    try {
      console.log("🚀 Démarrage du questionnaire depuis useQuestionnaireStarter");
      
      // Utiliser le toast pour une notification visible
      toast.success("Questionnaire démarré", {
        id: "questionnaire-started", // ID unique pour éviter les duplications
        duration: 3000
      });
      
      // Stocker dans localStorage pour persistance et système de fallback
      localStorage.setItem('questionnaire_started', 'true');
      localStorage.setItem('show_introduction', 'false');
      
      // Définir explicitement à false avec console.log pour traçage
      console.log("État avant mise à jour - showIntroduction:", showIntroduction);
      setShowIntroduction(false);
      console.log("✅ showIntroduction défini à false");
    } catch (error) {
      console.error("❌ Erreur lors du démarrage:", error);
      toast.error("Une erreur est survenue. Tentative de correction en cours...");
      
      // Fallback ultime - force le rendu sans l'introduction
      setTimeout(() => {
        setShowIntroduction(false);
      }, 500);
    }
  };

  // Vérifier les paramètres d'URL ou l'état de location pour le démarrage forcé
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const forceStart = searchParams.get('start') === 'true' || 
                      (location.state && location.state.forceStart === true);
    
    if (forceStart) {
      console.log("⚡ Démarrage forcé détecté via URL ou état");
      handleStartQuestionnaire();
    }
  }, [location]);

  // Log d'état pour le débogage et vérification de cohérence
  useEffect(() => {
    console.log("📊 useQuestionnaireStarter - État actuel - showIntroduction:", showIntroduction,
                "localStorage.questionnaire_started:", localStorage.getItem('questionnaire_started'),
                "localStorage.show_introduction:", localStorage.getItem('show_introduction'));
    
    // Vérifier si nous devons forcer l'affichage du questionnaire
    const hasStarted = localStorage.getItem('questionnaire_started') === 'true';
    const forceHideIntro = localStorage.getItem('show_introduction') === 'false';
    
    if ((hasStarted || forceHideIntro) && showIntroduction) {
      console.log("🔄 Force l'affichage du questionnaire via localStorage");
      setShowIntroduction(false);
    }
  }, [showIntroduction, setShowIntroduction]);

  return {
    handleStartQuestionnaire,
    shouldShowIntroduction: showIntroduction && 
                           localStorage.getItem('questionnaire_started') !== 'true' &&
                           localStorage.getItem('show_introduction') !== 'false'
  };
};

/**
 * Composant principal pour le contenu du questionnaire
 * Gère l'affichage de l'introduction ou du questionnaire/analyse
 */
const QuestionnaireContainer = () => {
  const { showAnalysis } = useQuestionnaire();
  const { handleStartQuestionnaire, shouldShowIntroduction } = useQuestionnaireStarter();
  
  if (shouldShowIntroduction) {
    console.log("🖥️ Affichage de l'introduction");
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
  console.log("🖥️ Affichage du questionnaire ou de l'analyse");
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

export default QuestionnaireContainer;
