
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
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Main content component for the questionnaire
 */
const QuestionnaireContent = () => {
  const { showAnalysis, showIntroduction, setShowIntroduction } = useQuestionnaire();
  const [forceRender, setForceRender] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Fonction pour démarrer le questionnaire avec gestion d'erreur et logging
  const handleStartQuestionnaire = () => {
    try {
      console.log("🚀 Démarrage du questionnaire depuis QuestionnaireContent");
      
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
      
      // Forcer un nouveau rendu immédiatement
      setForceRender(prev => !prev);
      
      // Double vérification après un court délai
      setTimeout(() => {
        if (showIntroduction) {
          console.log("⚠️ showIntroduction est toujours true après la mise à jour, forçage direct");
          setShowIntroduction(false);
          setForceRender(prev => !prev);
        }
      }, 300);
    } catch (error) {
      console.error("❌ Erreur lors du démarrage:", error);
      toast.error("Une erreur est survenue. Tentative de correction en cours...");
      
      // Fallback ultime - force le rendu sans l'introduction
      setTimeout(() => {
        setShowIntroduction(false);
        setForceRender(prev => !prev);
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
    console.log("📊 État actuel - showIntroduction:", showIntroduction, 
                "showAnalysis:", showAnalysis, 
                "forceRender:", forceRender,
                "localStorage.questionnaire_started:", localStorage.getItem('questionnaire_started'),
                "localStorage.show_introduction:", localStorage.getItem('show_introduction'));
    
    // Vérifier si nous devons forcer l'affichage du questionnaire
    const hasStarted = localStorage.getItem('questionnaire_started') === 'true';
    const forceHideIntro = localStorage.getItem('show_introduction') === 'false';
    
    if ((hasStarted || forceHideIntro) && showIntroduction) {
      console.log("🔄 Force l'affichage du questionnaire via localStorage");
      setShowIntroduction(false);
    }
  }, [showIntroduction, showAnalysis, forceRender, setShowIntroduction]);

  // Rendu conditionnel avec vérification supplémentaire de localStorage
  const shouldShowIntroduction = showIntroduction && 
                               localStorage.getItem('questionnaire_started') !== 'true' &&
                               localStorage.getItem('show_introduction') !== 'false';
  
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

/**
 * Page Questionnaire - Évalue le profil d'investisseur de l'utilisateur
 * Présente une série de questions pour déterminer la tolérance au risque
 */
const Questionnaire = () => {
  const navigate = useNavigate();
  
  // Réinitialiser l'état du démarrage et gérer les états incohérents
  useEffect(() => {
    console.log("🔁 Montage de la page Questionnaire - vérification des états");
    
    // Fonction pour nettoyer ou réinitialiser les états
    const cleanup = () => {
      try {
        // Vérifiez si nous sommes sur la page questionnaire
        if (window.location.pathname.includes('questionnaire')) {
          console.log("✅ Nettoyage des états au chargement de la page questionnaire");
          
          // Si on recharge la page, on vérifie la cohérence de l'état
          if (document.referrer === "" || document.referrer.includes('questionnaire')) {
            // C'est un rechargement de page ou navigation directe
            console.log("📝 Maintien des paramètres de progression si disponibles");
          } else {
            // C'est une navigation depuis une autre page
            console.log("🧹 Réinitialisation complète des états pour nouveau démarrage");
            localStorage.removeItem('questionnaire_started');
            localStorage.removeItem('show_introduction');
          }
        }
      } catch (error) {
        console.error("❌ Erreur lors du nettoyage des états:", error);
      }
    };
    
    // Appliquer la logique de nettoyage
    cleanup();
    
    // Vérifier si nous devons forcer la navigation vers analyse de profil
    const isComplete = localStorage.getItem('dadvisor_temp_complete') === 'true';
    if (isComplete) {
      console.log("⚠️ Questionnaire déjà complété, redirection vers l'analyse de profil");
      navigate("/profile-analysis");
    }
    
    // Nettoyer aussi au démontage
    return cleanup;
  }, [navigate]);
  
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
