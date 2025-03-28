
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface QuestionnaireIntroductionProps {
  onStart: () => void;
}

/**
 * Composant qui affiche l'introduction et les explications du questionnaire
 * @param onStart Fonction appelée lorsque l'utilisateur clique sur "Commencer"
 */
const QuestionnaireIntroduction = ({ onStart }: QuestionnaireIntroductionProps) => {
  // Fonction pour gérer le clic avec un log de débogage
  const handleStartClick = () => {
    console.log("Bouton commencer cliqué");
    
    // Attendre un peu pour éviter les clics accidentels doubles
    setTimeout(() => {
      // Appel explicite de la fonction onStart passée en props
      if (typeof onStart === 'function') {
        onStart();
      } else {
        console.error("La fonction onStart n'est pas définie correctement");
      }
    }, 50);
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
            className="px-8 bg-dadvisor-blue hover:bg-dadvisor-navy"
          >
            Commencer le questionnaire
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionnaireIntroduction;
