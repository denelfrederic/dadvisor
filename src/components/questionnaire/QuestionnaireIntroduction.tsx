
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-8 rounded-2xl w-full max-w-2xl mx-auto mb-10"
    >
      <h2 className="text-2xl font-bold mb-4 text-dadvisor-navy">Pourquoi ce questionnaire ?</h2>
      
      <div className="space-y-4 text-gray-700">
        <p>
          Ce questionnaire est conçu pour évaluer votre <strong>profil d'investisseur</strong> en fonction de plusieurs facteurs clés :
        </p>
        
        <ul className="list-disc pl-6 space-y-2">
          <li>Votre <strong>tolérance au risque</strong> - capacité à supporter les fluctuations du marché sans paniquer</li>
          <li>Votre <strong>horizon d'investissement</strong> - durée pendant laquelle vous prévoyez de laisser votre argent investi</li>
          <li>Vos <strong>objectifs financiers</strong> - préservation du capital, revenus, croissance, etc.</li>
          <li>Votre <strong>expérience</strong> en matière d'investissement</li>
          <li>Votre <strong>situation personnelle</strong> - âge, situation familiale, patrimoine, etc.</li>
        </ul>
        
        <h3 className="text-xl font-medium mt-6 mb-2 text-dadvisor-navy">Notre méthode</h3>
        
        <p>
          Notre questionnaire utilise une méthodologie rigoureuse développée par des experts en finance comportementale. 
          Chaque question est pondérée et contribue à votre score final qui détermine votre profil d'investisseur.
        </p>
        
        <p>
          Le questionnaire comprend environ 10 questions et prend généralement 5 à 10 minutes à compléter. 
          À la fin, vous recevrez une analyse détaillée de votre profil ainsi que des recommandations 
          de portefeuilles adaptés à votre situation.
        </p>
        
        <p className="italic mt-4">
          Note : Vous pouvez à tout moment revenir en arrière pour modifier vos réponses. Le but est d'obtenir 
          l'image la plus précise possible de votre profil d'investisseur.
        </p>
        
        <div className="text-center mt-8">
          <Button onClick={onStart} size="lg" className="px-8">
            Commencer le questionnaire
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionnaireIntroduction;
