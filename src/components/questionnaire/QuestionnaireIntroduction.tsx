
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface QuestionnaireIntroductionProps {
  onStart: () => void;
}

/**
 * Composant qui affiche l'introduction et les explications du questionnaire
 * @param onStart Fonction appelée lorsque l'utilisateur clique sur "Commencer"
 */
const QuestionnaireIntroduction = ({ onStart }: QuestionnaireIntroductionProps) => {
  const [isClicked, setIsClicked] = useState(false);
  const navigate = useNavigate();
  
  // Effet pour suivre l'état du clic et éviter les clics multiples
  useEffect(() => {
    if (isClicked) {
      const timer = setTimeout(() => {
        setIsClicked(false);
      }, 3000); // Augmenté à 3 secondes pour éviter les clics accidentels multiples
      
      return () => clearTimeout(timer);
    }
  }, [isClicked]);
  
  // Fonction pour gérer le clic avec un log de débogage et fallbacks
  const handleStartClick = () => {
    if (isClicked) {
      console.log("Tentative de double-clic ignorée");
      return; // Éviter les clics multiples
    }
    
    console.log("⭐ Bouton commencer cliqué - Tentative de démarrage");
    setIsClicked(true);
    
    // Notification visible pour l'utilisateur
    toast.success("Démarrage du questionnaire...");
    
    // Stocker l'état dans localStorage pour forcer l'interface
    try {
      localStorage.setItem('questionnaire_started', 'true');
      localStorage.setItem('show_introduction', 'false');
      console.log("✅ État stocké dans localStorage: questionnaire_started=true, show_introduction=false");
    } catch (error) {
      console.error("❌ Erreur lors du stockage dans localStorage:", error);
    }
    
    // Méthode 1: Appel direct de la fonction onStart
    try {
      if (typeof onStart === 'function') {
        console.log("🔄 Appel de onStart() - méthode 1");
        onStart();
      } else {
        console.error("❌ onStart n'est pas une fonction - méthode 1");
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'appel de onStart() - méthode 1:", error);
    }
    
    // Méthode 2: Appel différé (timeout) pour s'assurer que le state a été mis à jour
    setTimeout(() => {
      try {
        if (typeof onStart === 'function') {
          console.log("🔄 Appel de onStart() - méthode 2 (timeout)");
          onStart();
        } else {
          console.error("❌ onStart n'est pas une fonction - méthode 2");
        }
      } catch (error) {
        console.error("❌ Erreur lors de l'appel de onStart() - méthode 2:", error);
      }
    }, 300);
    
    // Méthode 3: Fallback - forcer la navigation après un délai
    setTimeout(() => {
      // Vérifier si localStorage indique toujours l'introduction
      const stillShowingIntro = localStorage.getItem('show_introduction') !== 'false';
      
      if (stillShowingIntro) {
        console.log("⚠️ L'introduction est toujours affichée après le délai - activation du fallback");
        try {
          // Forcer la navigation programmatique comme dernier recours
          navigate("/questionnaire", { replace: true, state: { forceStart: true } });
          console.log("✅ Navigation forcée vers /questionnaire");
          
          // Réexécution de onStart comme dernier recours
          if (typeof onStart === 'function') {
            console.log("🔄 Appel de onStart() - méthode 3 (fallback)");
            onStart();
          }
        } catch (error) {
          console.error("❌ Erreur lors de la navigation forcée:", error);
          // Ultime solution - rafraîchir la page
          toast.error("Problème de démarrage. Tentative de rechargement...");
          window.location.href = "/questionnaire?start=true";
        }
      }
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-8 rounded-2xl w-full max-w-2xl mx-auto mb-10"
    >
      <h2 className="text-2xl font-bold mb-4 text-dadvisor-navy">Découvrez votre profil d'investisseur</h2>
      
      <div className="space-y-4 text-gray-700">
        <p>
          Ce questionnaire évalue votre profil d'investisseur selon quatre critères essentiels :
        </p>
        
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Tolérance au risque</strong> - votre réaction face aux fluctuations du marché</li>
          <li><strong>Horizon d'investissement</strong> - durée prévue de placement</li>
          <li><strong>Objectifs financiers</strong> - préservation, revenus ou croissance</li>
          <li><strong>Expérience d'investissement</strong> - votre niveau de connaissance</li>
        </ul>
        
        <p className="mt-2">
          L'évaluation ne prend que quelques minutes et vous fournira une analyse détaillée de votre profil.
        </p>
        
        <p className="text-sm italic mt-2">
          Vous pouvez revenir en arrière si nécessaire pour ajuster vos réponses.
        </p>
        
        <div className="text-center mt-6">
          <Button 
            onClick={handleStartClick} 
            size="lg" 
            disabled={isClicked}
            className={`px-8 py-3 text-base ${isClicked ? 'opacity-75 bg-gray-400' : 'bg-dadvisor-blue hover:bg-dadvisor-navy'} transition-all duration-300 relative shadow-lg hover:shadow-xl focus:ring-2 focus:ring-dadvisor-blue/50 focus:outline-none`}
          >
            {isClicked ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Démarrage en cours...
              </span>
            ) : (
              "Commencer le questionnaire"
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionnaireIntroduction;
