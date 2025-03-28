
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Hook personnalisé pour gérer les effets secondaires de la page du questionnaire
 * Gère les nettoyages, réinitialisations et redirections nécessaires
 */
export const useQuestionnairePageEffects = () => {
  const navigate = useNavigate();
  
  // Effet pour gérer l'initialisation, le nettoyage et les redirections
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
};
